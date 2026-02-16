import { Overrides } from 'ethers'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { expect } from 'chai'
import { deployFullInfrastructureInTests, deployStableCoinInTests } from '@test/shared'
import { HederaReserveFacet, HederaReserveFacet__factory } from '@contracts'
import {
  DEFAULT_TOKEN,
  delay,
  deployContract,
  DeployContractCommand,
  DeployFullInfrastructureCommand,
  GAS_LIMIT,
  MESSAGES,
  ADDRESS_ZERO
} from '@scripts'
import { ethers } from 'hardhat'

describe('HederaReserve Tests Before Deploying Full Infrastructure', function () {
    // Accounts
    let operator: SignerWithAddress

    const reserve = 100n * DEFAULT_TOKEN.tokenFactor

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        ;[operator] = await ethers.getSigners()
    })

    it('Cannot initialize with zero address admin', async function () {
        const hederaReserveContract = await deployContract(
            await DeployContractCommand.newInstance({
                factory: new HederaReserveFacet__factory(),
                signer: operator,
                deployType: 'tup',
                deployedContract: undefined,
                overrides: { gasLimit: GAS_LIMIT.high },
            })
        )

        const hederaReserve = HederaReserveFacet__factory.connect(
          hederaReserveContract.proxyAddress!, operator
        )

        await expect(
            hederaReserve.initialize(reserve, ADDRESS_ZERO, {
                gasLimit: GAS_LIMIT.hederaReserve.initialize,
            })
        )
            .to.be.revertedWithCustomError(hederaReserve, 'AddressZero')
            .withArgs(ADDRESS_ZERO)
    })
})

describe('HederaReserve Tests', function () {
    // Contracts
    let reserveProxyAddress: string
    let hederaReserveFacet: HederaReserveFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    const reserve = 100n * DEFAULT_TOKEN.tokenFactor

    async function setFacets(address: string) {
        hederaReserveFacet = HederaReserveFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        const result = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: deployedContracts.businessLogicResolver.proxyAddress!,
            stableCoinFactoryProxyAddress: deployedContracts.stableCoinFactoryFacet.proxyAddress!,
        })
        reserveProxyAddress = result.reserveProxyAddress!
        await setFacets(reserveProxyAddress)
    })

    it('Check initialize can only be run once', async function () {
        await expect(
            hederaReserveFacet.initialize(reserve, operator.address, {
                gasLimit: GAS_LIMIT.hederaReserve.initialize,
            })
        ).to.be.revertedWithCustomError(hederaReserveFacet, 'ContractIsAlreadyInitialized')
    })

    it('Cannot update admin with zero address', async function () {
        const ONE = 1

        await expect(
            hederaReserveFacet.setAdmin(ADDRESS_ZERO, {
                gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
            })
        )
            .to.be.revertedWithCustomError(hederaReserveFacet, 'AddressZero')
            .withArgs(ADDRESS_ZERO)
    })

    it('Update admin address', async function () {
        const ONE = 1

        await expect(
            hederaReserveFacet.setAdmin(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
            })
        )
            .to.emit(hederaReserveFacet, 'AdminChanged')
            .withArgs(operator.address, nonOperator.address)

        // Set amount to 1
        hederaReserveFacet = hederaReserveFacet.connect(nonOperator)
        await expect(
            hederaReserveFacet.setAmount(ONE, {
                gasLimit: GAS_LIMIT.hederaReserve.setAmount,
            })
        )
            .to.emit(hederaReserveFacet, 'AmountChanged')
            .withArgs(100000000000, ONE)

        await delay({ time: 1, unit: 'sec' })
        const amount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amount.answer).to.equals(ONE.toString())

        // Reset to original state
        await expect(
            hederaReserveFacet.setAdmin(operator.address, {
                gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
            })
        )
            .to.emit(hederaReserveFacet, 'AdminChanged')
            .withArgs(nonOperator.address, operator.address)

        hederaReserveFacet = hederaReserveFacet.connect(operator)
        await expect(
            hederaReserveFacet.setAmount(reserve, {
                gasLimit: GAS_LIMIT.hederaReserve.setAmount,
            })
        )
            .to.emit(hederaReserveFacet, 'AmountChanged')
            .withArgs(ONE, reserve)

        await delay({ time: 1, unit: 'sec' })
        const resetAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(resetAmount.answer).to.equals(reserve.toString())
    })

    it('Update admin address throw error client no isAdmin', async function () {
        hederaReserveFacet = hederaReserveFacet.connect(nonOperator)
        await expect(
            hederaReserveFacet.setAdmin(nonOperator.address, {
                gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
            })
        )
            .to.be.revertedWithCustomError(hederaReserveFacet, 'OnlyAdmin')
            .withArgs(nonOperator)
    })

    it('Update reserve throw error client no isAdmin', async function () {
        await expect(
            hederaReserveFacet.setAmount(1, {
                gasLimit: GAS_LIMIT.hederaReserve.setAmount,
            })
        )
            .to.be.revertedWithCustomError(hederaReserveFacet, 'OnlyAdmin')
            .withArgs(nonOperator)
    })

    it('Update reserve', async function () {
        hederaReserveFacet = hederaReserveFacet.connect(operator)
        const beforeUpdateAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })

        await expect(
            hederaReserveFacet.setAmount(1, {
                gasLimit: GAS_LIMIT.hederaReserve.setAmount,
            })
        )
            .to.emit(hederaReserveFacet, 'AmountChanged')
            .withArgs(reserve, 1)

        await delay({ time: 1, unit: 'sec' })
        const afterUpdateAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(beforeUpdateAmount).not.to.equals(afterUpdateAmount)
        expect(afterUpdateAmount.answer).to.equals(1n)

        // Reset to original state
        await expect(
            hederaReserveFacet.setAmount(reserve, {
                gasLimit: GAS_LIMIT.hederaReserve.setAmount,
            })
        )
            .to.emit(hederaReserveFacet, 'AmountChanged')
            .withArgs(1, reserve)

        await delay({ time: 1, unit: 'sec' })
        const amountReset = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amountReset.answer).to.equals(reserve.toString())
    })

    it('Get decimals', async function () {
        expect(
            await hederaReserveFacet.decimals({
                gasLimit: GAS_LIMIT.hederaReserve.decimals,
            })
        ).to.equals(2)
    })

    it('Get description', async function () {
        expect(
            await hederaReserveFacet.description({
                gasLimit: GAS_LIMIT.hederaReserve.description,
            })
        ).to.equals('Example Hedera Reserve for ChainLink')
    })

    it('Get version', async function () {
        expect(
            await hederaReserveFacet.version({
                gasLimit: GAS_LIMIT.hederaReserve.version,
            })
        ).to.equals(1)
    })

    it('Get latestRoundData', async function () {
        const amountReset = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amountReset.answer).to.equals(reserve.toString())
    })

    it('Get round data is not implemented', async function () {
        await expect(hederaReserveFacet.getRoundData(1))
          .to.be.revertedWithCustomError(hederaReserveFacet, 'NotImplemented')
    })
})
