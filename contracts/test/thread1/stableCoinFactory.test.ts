import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    ADDRESS_ZERO,
    DEFAULT_TOKEN,
    deployContract,
    DeployContractCommand,
    DeployFullInfrastructureCommand,
    deployStableCoin,
    DeployStableCoinCommand,
    MESSAGES,
    DEFAULT_CONFIG_VERSION
} from '@scripts'
import { deployFullInfrastructureInTests, GAS_LIMIT } from '@test/shared'
import {
  HederaReserveFacet__factory,
  ReserveFacet,
  ReserveFacet__factory,
  StableCoinFactoryFacet,
  StableCoinFactoryFacet__factory
} from '@contracts'

const toReserve = (amount: bigint) => {
    return amount / 10n
}

let businessLogicResolver: string
let stableCoinFactoryProxy: string

describe('StableCoinFactory Tests', function () {
    // Contracts
    let reserveFacet: ReserveFacet
    let stableCoinFactoryFacet: StableCoinFactoryFacet
    // Accounts
    let operator: SignerWithAddress
    before(async () => {
        // mute | mock console.log
        //console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        businessLogicResolver = deployedContracts.businessLogicResolver.proxyAddress!
        stableCoinFactoryProxy = deployedContracts.stableCoinFactoryFacet.proxyAddress!
        stableCoinFactoryFacet = StableCoinFactoryFacet__factory.connect(stableCoinFactoryProxy, operator)
    })

    it('Cannot deploy a Stablecoin if Business Logic Resolver has zero address', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed,
            businessLogicResolverProxyAddress: ADDRESS_ZERO,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await expect(deployStableCoin(deployCommand))
          .to.be.revertedWithCustomError(stableCoinFactoryFacet, 'AddressZero')
          .withArgs(ADDRESS_ZERO)
    })

    it('Cannot deploy a Stablecoin if configuration id key is 0', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
            stableCoinConfigurationId: {
              key: ethers.ZeroHash,
              version: DEFAULT_CONFIG_VERSION
            }
        })
        await expect(deployStableCoin(deployCommand))
          .to.be.revertedWithCustomError(stableCoinFactoryFacet, 'Bytes32Zero')
          .withArgs(ethers.ZeroHash)
    })

    it('Create StableCoin setting all token keys to the Proxy', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            initialAmountDataFeed: DEFAULT_TOKEN.initialAmountDataFeed,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await deployStableCoin(deployCommand)
    })

    it('Create StableCoin setting all token keys to the Account', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: (DEFAULT_TOKEN.initialSupply + 100000n).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await deployStableCoin(deployCommand)
    })

    it('Create StableCoin setting all token keys to the Account, with a very close reserve number', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: (DEFAULT_TOKEN.initialSupply + 1n).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await deployStableCoin(deployCommand)
    })

    it('Create StableCoin setting all token keys to the Account, with no reserve', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            createReserve: false,
            initialAmountDataFeed: (DEFAULT_TOKEN.initialSupply + 1n).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })

        const deploymentResult = await deployStableCoin(deployCommand)

        reserveFacet = ReserveFacet__factory.connect(deploymentResult.stableCoinProxyAddress, operator)

        const reserveAddress = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const reserveAmount = result[0]

        expect(await reserveAddress).to.equal(ADDRESS_ZERO)
        expect(await reserveAmount).to.equal(0)

        expect(deploymentResult.reserveProxyAddress).to.equal(ADDRESS_ZERO)
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: toReserve(DEFAULT_TOKEN.initialSupply).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        const deploymentResult = await deployStableCoin(deployCommand)

        reserveFacet = ReserveFacet__factory.connect(deploymentResult.stableCoinProxyAddress, operator)

        const reserveAddress = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const reserveAmount = result[0]

        expect(await reserveAddress).not.to.equal(ADDRESS_ZERO)
        expect((await reserveAmount).toString()).to.equal(toReserve(DEFAULT_TOKEN.initialSupply).toString())
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve, expect it to fail', async function () {
        // Deploy Token using Client
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 0n,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: (toReserve(DEFAULT_TOKEN.initialSupply) - 1n).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await expect(deployStableCoin(deployCommand)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, expect it to fail', async function () {
        // Deploy Token using Client
        const command = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: 1n.toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await expect(deployStableCoin(command)).to.be.rejectedWith(Error)
    })

    it.skip('Create StableCoin setting an initial supply over the reserve, expect it to fail with a very close number', async function () {
        // Deploy Token using Client
        const command = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: DEFAULT_TOKEN.initialSupply,
                maxSupply: DEFAULT_TOKEN.maxSupply,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            initialAmountDataFeed: (toReserve(DEFAULT_TOKEN.initialSupply) - 1n).toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await expect(deployStableCoin(command)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting a reserve with the amount outdated, expected to fail', async function () {
        // first deploy Hedera Reserve
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

        await hederaReserve.initialize(1, operator.address, {
          gasLimit: GAS_LIMIT.hederaReserve.initialize,
        })

        const reserveAmount = 10n
        // Deploy Token using Client
        const initSupplyAmount = 0n
        const maxSupplyAmount = reserveAmount
        // Deploy Token using Client
        const command = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: initSupplyAmount,
                maxSupply: maxSupplyAmount,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            createReserve: false,
            reserveAddress: await hederaReserve.getAddress(),
            updatedAtThreshold: 1,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })

        await expect(deployStableCoin(command))
          .to.be.revertedWithCustomError(stableCoinFactoryFacet, 'ReserveAmountOutdated')
    })

    it('Create StableCoin setting an initial supply over the reserve, when the reserve is provided and not deployed, expect it to fail', async function () {
        // first deploy Hedera Reserve
        const reserve = await new HederaReserveFacet__factory(operator).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
        await reserve.waitForDeployment()

        const reserveAmount = 1n
        // Deploy Token using Client
        const initSupplyAmount = reserveAmount + 1n
        const maxSupplyAmount = initSupplyAmount + 1n
        // Deploy Token using Client
        const command = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: initSupplyAmount,
                maxSupply: maxSupplyAmount,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            createReserve: false,
            reserveAddress: await reserve.getAddress(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        await expect(deployStableCoin(command)).to.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply matching the reserve', async function () {
        // first deploy Hedera Reserve
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

        await hederaReserve.initialize(1, operator.address, {
          gasLimit: GAS_LIMIT.hederaReserve.initialize,
        })

        const reserveAmount = 10n
        // Deploy Token using Client
        const initSupplyAmount = 0n
        const maxSupplyAmount = reserveAmount
        // Deploy Token using Client
        const command = await DeployStableCoinCommand.newInstance({
            signer: operator,
            useEnvironment: true,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: DEFAULT_TOKEN.decimals,
                initialSupply: initSupplyAmount,
                maxSupply: maxSupplyAmount,
                memo: DEFAULT_TOKEN.memo,
                freeze: false,
            },
            allToContract: false,
            createReserve: false,
            reserveAddress: await hederaReserve.getAddress(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })

        await deployStableCoin(command)
    })
})
