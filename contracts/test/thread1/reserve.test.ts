import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    HederaReserveFacet__factory,
    ReserveFacet,
    ReserveFacet__factory,
} from '@contracts'
import {
    DEFAULT_TOKEN,
    delay,
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    deployStableCoin,
    DeployStableCoinCommand,
    MESSAGES,
    ValidateTxResponseCommand,
} from '@scripts'
import { GAS_LIMIT } from '@test/shared'

let operator: SignerWithAddress
let nonOperator: SignerWithAddress
let businessLogicResolver: string
let stableCoinFactoryProxy: string

const RESERVE_DECIMALS = 2n
const ONE_TOKEN_FACTOR = 10n ** 1n
const TWO_TOKEN_FACTOR = 10n ** 2n
const THREE_TOKEN_FACTOR = 10n ** 3n
const INIT_SUPPLY_ONE_DECIMALS = 10n * ONE_TOKEN_FACTOR
const MAX_SUPPLY_ONE_DECIMALS = 1000n * ONE_TOKEN_FACTOR
const INIT_SUPPLY_TWO_DECIMALS = 100n * TWO_TOKEN_FACTOR
const MAX_SUPPLY_TWO_DECIMALS = 1000n * TWO_TOKEN_FACTOR
const INIT_SUPPLY_THREE_DECIMALS = 100n * THREE_TOKEN_FACTOR
const MAX_SUPPLY_THREE_DECIMALS = 1000n * THREE_TOKEN_FACTOR
const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
const INIT_RESERVE_100 = 10n ** RESERVE_DECIMALS * 100n
const INIT_RESERVE_1000 = 10n ** RESERVE_DECIMALS * 1000n

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
    businessLogicResolver = deployedContracts.businessLogicResolver.proxyAddress!
    stableCoinFactoryProxy = deployedContracts.stableCoinFactoryFacet.proxyAddress!
})

describe('➡️ Reserve Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let reserveProxyAddress: string
    let reserveFacet: ReserveFacet

    async function setFacets(address: string) {
        reserveFacet = ReserveFacet__factory.connect(address, operator)
    }

    before(async () => {
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 3n,
                initialSupply: INIT_SUPPLY_THREE_DECIMALS,
                maxSupply: MAX_SUPPLY_THREE_DECIMALS,
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_RESERVE_100.toString(),
            createReserve: true,
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        const result = await deployStableCoin(deployCommand)
        reserveProxyAddress = result.reserveProxyAddress!
        stableCoinProxyAddress = result.stableCoinProxyAddress

        await setFacets(stableCoinProxyAddress)
    })

    it('Get getReserveAmount', async () => {
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const reserveAmount = result[0]
        expect(reserveAmount.toString()).to.equals(INIT_RESERVE_100.toString())
    })

    it('Get updatedAt threshold', async () => {
        const initialUpdatedAtThreshold = await reserveFacet.getUpdatedAtThreshold()
        expect(initialUpdatedAtThreshold.toString()).to.equals('0')

        const FINAL_THRESHOLD = 1000

        await reserveFacet.updateUpdatedAtThreshold(FINAL_THRESHOLD)
        await delay({ time: 1, unit: 'sec' })

        const finalUpdatedAtThreshold = await reserveFacet.getUpdatedAtThreshold()
        expect(finalUpdatedAtThreshold.toString()).to.equals(FINAL_THRESHOLD.toString())

        await reserveFacet.updateUpdatedAtThreshold('0')
    })

    it('Set updatedAt threshold fails if set by non Admin', async () => {
        await expect(reserveFacet.connect(nonOperator).updateUpdatedAtThreshold('1')).to.be.revertedWithCustomError(
            reserveFacet,
            'AccountHasNoRole'
        )
    })

    it('Get datafeed', async () => {
        const datafeed = await reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        expect(datafeed.toUpperCase()).to.equals(reserveProxyAddress.toUpperCase())
    })

    it('Update datafeed', async () => {
        const beforeReserve = reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const beforeDataFeed = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })

        const hederaReserveFacet = await new HederaReserveFacet__factory(operator).deploy({
            gasLimit: GAS_LIMIT.hederaTokenManager.facetDeploy,
        })
        await hederaReserveFacet.waitForDeployment()

        const updateResponse = await reserveFacet.updateReserveAddress(hederaReserveFacet, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateReserveAddress,
        })
        await new ValidateTxResponseCommand({ txResponse: updateResponse }).execute()

        const afterReserve = reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const afterDataFeed = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })

        expect(await beforeDataFeed).not.to.equals(await afterDataFeed)
        expect(await beforeReserve).not.to.equals(await afterReserve)
        expect(await afterReserve).to.equals(0)
    })
})

describe('Reserve Tests with reserve and token with same Decimals', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let reserveFacet: ReserveFacet
    let cashInFacet: CashInFacet

    async function setFacets(address: string) {
        reserveFacet = ReserveFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line

        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 2n,
                initialSupply: INIT_SUPPLY_TWO_DECIMALS,
                maxSupply: MAX_SUPPLY_TWO_DECIMALS,
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_RESERVE_1000.toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        const result = await deployStableCoin(deployCommand)
        stableCoinProxyAddress = result.stableCoinProxyAddress

        await setFacets(stableCoinProxyAddress)
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = 10n * TWO_TOKEN_FACTOR

        // Get the initial reserve amount
        const initialResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const initialReserve = initialResult[0]

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const finalReserve = finalResult[0] - AmountToMint
        const expectedTotalReserve = initialReserve - AmountToMint
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const totalReserve = result[0]

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()
        ).to.eventually.be.rejectedWith(Error)
    })
})

describe('Reserve Tests with reserve decimals higher than token decimals', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let reserveFacet: ReserveFacet
    let cashInFacet: CashInFacet

    async function setFacets(address: string) {
        reserveFacet = ReserveFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line

        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 1n,
                initialSupply: INIT_SUPPLY_ONE_DECIMALS,
                maxSupply: MAX_SUPPLY_ONE_DECIMALS,
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_RESERVE_1000.toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        const result = await deployStableCoin(deployCommand)
        stableCoinProxyAddress = result.stableCoinProxyAddress

        await setFacets(stableCoinProxyAddress)
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = 10n * ONE_TOKEN_FACTOR

        // Get the initial reserve amount
        const initialResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const initialReserve = initialResult[0]

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const finalReserve = finalResult[0] - AmountToMint
        const expectedTotalReserve = initialReserve - AmountToMint
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const totalReserve = result[0]

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)
    })
})

describe('Reserve Tests with reserve decimals lower than token decimals', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let reserveFacet: ReserveFacet
    let cashInFacet: CashInFacet

    async function setFacets(address: string) {
        reserveFacet = ReserveFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line

        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 3n,
                initialSupply: INIT_SUPPLY_THREE_DECIMALS,
                maxSupply: MAX_SUPPLY_THREE_DECIMALS,
                memo: TOKEN_MEMO,
                freeze: false,
            },
            initialAmountDataFeed: INIT_RESERVE_1000.toString(),
            businessLogicResolverProxyAddress: businessLogicResolver,
            stableCoinFactoryProxyAddress: stableCoinFactoryProxy,
        })
        const result = await deployStableCoin(deployCommand)
        stableCoinProxyAddress = result.stableCoinProxyAddress

        await setFacets(stableCoinProxyAddress)
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = 10n * THREE_TOKEN_FACTOR

        // Get the initial reserve amount
        const initialResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const initialReserve = initialResult[0]

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalResult = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const finalReserve = finalResult[0] - AmountToMint
        const expectedTotalReserve = initialReserve - AmountToMint
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const totalReserve = result[0]

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve + 1n, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)
    })

    it('Can not mint tokens if updated at date expired', async function () {
        // Retrieve current reserve amount
        const result = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const totalReserve = result[0]

        await reserveFacet.updateUpdatedAtThreshold('1')
        await delay({ time: 2, unit: 'sec' })

        await expect(cashInFacet.mint(operator.address, totalReserve - 1n)).to.be.revertedWithCustomError(
            cashInFacet,
            'ReserveAmountOutdated'
        )

        await reserveFacet.updateUpdatedAtThreshold('0')
    })
})
