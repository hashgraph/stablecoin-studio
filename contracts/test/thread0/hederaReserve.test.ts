import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { deployStableCoinInTests } from '@test/shared'
import { HederaReserveFacet, HederaReserveFacet__factory } from '@typechain-types'
import {
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    GAS_LIMIT,
    MESSAGES,
    ValidateTxResponseCommand,
} from '@scripts'
import { ethers } from 'hardhat'

describe('HederaReserve Tests', function () {
    // Contracts
    let reserveProxyAddress: string
    let hederaReserveFacet: HederaReserveFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    const reserve = BigNumber.from('100').mul(DEFAULT_TOKEN.tokenFactor)

    async function setFacets(address: string) {
        hederaReserveFacet = HederaReserveFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructure(
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
        const initResponse = await hederaReserveFacet.initialize(reserveProxyAddress, operator.address, {
            gasLimit: GAS_LIMIT.hederaReserve.initialize,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: initResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Update admin address', async function () {
        const ONE = BigNumber.from(1)

        // Set admin to nonOperator
        const setAdminResponse = await hederaReserveFacet.setAdmin(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
        })
        await new ValidateTxResponseCommand({ txResponse: setAdminResponse }).execute()
        // Set amount to 1
        const setAmountResponse = await hederaReserveFacet.connect(nonOperator).setAmount(ONE, {
            gasLimit: GAS_LIMIT.hederaReserve.setAmount,
        })
        await new ValidateTxResponseCommand({ txResponse: setAmountResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        const amount = await hederaReserveFacet.connect(nonOperator).latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amount.answer).to.equals(ONE.toString())

        // Reset to original state
        const resetAdminResponse = await hederaReserveFacet.connect(nonOperator).setAdmin(operator.address, {
            gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
        })
        await new ValidateTxResponseCommand({ txResponse: resetAdminResponse }).execute()
        const resetAmountResponse = await hederaReserveFacet.setAmount(reserve, {
            gasLimit: GAS_LIMIT.hederaReserve.setAmount,
        })
        await new ValidateTxResponseCommand({ txResponse: resetAmountResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        const resetAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(resetAmount.answer).to.equals(reserve.toString())
    })

    it('Update admin address throw error client no isAdmin', async function () {
        const txResponse = await hederaReserveFacet.connect(nonOperator).setAdmin(nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaReserve.setAdmin,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Update reserve throw error client no isAdmin', async function () {
        const txResponse = await hederaReserveFacet.connect(nonOperator).setAmount(BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaReserve.setAmount,
        })
        await expect(new ValidateTxResponseCommand({ txResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Update reserve', async function () {
        const beforeUpdateAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        const setAmountResponse = await hederaReserveFacet.setAmount(BigNumber.from(1), {
            gasLimit: GAS_LIMIT.hederaReserve.setAmount,
        })
        await new ValidateTxResponseCommand({ txResponse: setAmountResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        const afterUpdateAmount = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(beforeUpdateAmount).not.to.equals(afterUpdateAmount)
        expect(afterUpdateAmount.answer).to.equals(BigNumber.from(1).toString())

        // Reset to original state
        const resetAmountResponse = await hederaReserveFacet.setAmount(reserve, {
            gasLimit: GAS_LIMIT.hederaReserve.setAmount,
        })
        await new ValidateTxResponseCommand({ txResponse: resetAmountResponse }).execute()

        await delay({ time: 1, unit: 'sec' })
        const amountReset = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amountReset.answer).to.equals(reserve.toString())
    })

    it('Get decimals', async function () {
        const decimals = await hederaReserveFacet.decimals({
            gasLimit: GAS_LIMIT.hederaReserve.decimals,
        })
        expect(decimals).to.equals(2)
    })

    it('Get description', async function () {
        const description = await hederaReserveFacet.description({
            gasLimit: GAS_LIMIT.hederaReserve.description,
        })
        expect(description).to.equals('Example Hedera Reserve for ChainLink')
    })

    it('Get version', async function () {
        const version = await hederaReserveFacet.version({
            gasLimit: GAS_LIMIT.hederaReserve.version,
        })
        expect(version).to.equals(1)
    })

    it('Get latestRoundData', async function () {
        const amountReset = await hederaReserveFacet.latestRoundData({
            gasLimit: GAS_LIMIT.hederaReserve.latestRoundData,
        })
        expect(amountReset.answer).to.equals(reserve.toString())
    })
})
