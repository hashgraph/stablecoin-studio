import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    HederaReserveFacet,
    HederaReserveFacet__factory,
    ReserveFacet,
    ReserveFacet__factory,
} from '@typechain-types'
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
import { BigNumber } from 'ethers'

let operator: SignerWithAddress
let businessLogicResolver: string
let stableCoinFactoryProxy: string

const RESERVE_DECIMALS = 2
const ONE_TOKEN_FACTOR = BigNumber.from(10).pow(1)
const TWO_TOKEN_FACTOR = BigNumber.from(10).pow(2)
const THREE_TOKEN_FACTOR = BigNumber.from(10).pow(3)
const INIT_SUPPLY_ONE_DECIMALS = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)
const MAX_SUPPLY_ONE_DECIMALS = BigNumber.from(1000).mul(ONE_TOKEN_FACTOR)
const INIT_SUPPLY_TWO_DECIMALS = BigNumber.from(100).mul(TWO_TOKEN_FACTOR)
const MAX_SUPPLY_TWO_DECIMALS = BigNumber.from(1000).mul(TWO_TOKEN_FACTOR)
const INIT_SUPPLY_THREE_DECIMALS = BigNumber.from(100).mul(THREE_TOKEN_FACTOR)
const MAX_SUPPLY_THREE_DECIMALS = BigNumber.from(1000).mul(THREE_TOKEN_FACTOR)
const TOKEN_MEMO = 'Hedera Accelerator Stablecoin'
const INIT_RESERVE_100 = BigNumber.from(10).pow(RESERVE_DECIMALS).mul(BigNumber.from(100))
const INIT_RESERVE_1000 = BigNumber.from(10).pow(RESERVE_DECIMALS).mul(BigNumber.from(1000))

before(async () => {
    // mute | mock console.log
    console.log = () => {} // eslint-disable-line
    console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
    ;[operator] = await ethers.getSigners()

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
    let hederaReserveFacet: HederaReserveFacet

    async function setFacets(address: string) {
        reserveFacet = ReserveFacet__factory.connect(address, operator)
        hederaReserveFacet = HederaReserveFacet__factory.connect(address, operator)
    }

    before(async () => {
        const deployCommand = await DeployStableCoinCommand.newInstance({
            signer: operator,
            tokenInformation: {
                name: DEFAULT_TOKEN.name,
                symbol: DEFAULT_TOKEN.symbol,
                decimals: 3,
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
        const reserveAmount = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        expect(reserveAmount.toString()).to.equals(INIT_RESERVE_100.toString())
    })

    it('Get datafeed', async () => {
        const datafeed = await reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })
        expect(datafeed.toUpperCase()).not.to.equals(reserveProxyAddress.toUpperCase())
    })

    it('Update datafeed', async () => {
        const beforeReserve = reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const beforeDataFeed = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })

        const newReserve = (await beforeReserve).add(BigNumber.from('100').mul(THREE_TOKEN_FACTOR))

        const updateResponse = await reserveFacet.updateReserveAddress(reserveProxyAddress, {
            gasLimit: GAS_LIMIT.hederaTokenManager.updateReserveAddress,
        })
        await new ValidateTxResponseCommand({ txResponse: updateResponse }).execute()

        const initHederaResponse = await hederaReserveFacet.initialize(BigNumber.from(newReserve), operator.address, {
            gasLimit: GAS_LIMIT.hederaReserve.initialize,
        })
        await new ValidateTxResponseCommand({ txResponse: initHederaResponse }).execute()

        const afterReserve = reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })
        const afterDataFeed = reserveFacet.getReserveAddress({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAddress,
        })

        expect(await beforeDataFeed).not.to.equals(await afterDataFeed)
        expect(await beforeReserve).not.to.equals(await afterReserve)
        expect(await afterReserve).to.equals(newReserve)
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
                decimals: 2,
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
        const AmountToMint = BigNumber.from(10).mul(TWO_TOKEN_FACTOR)

        // Get the initial reserve amount
        const initialReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalReserve = (
            await reserveFacet.getReserveAmount({
                gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
            })
        ).sub(AmountToMint)
        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve.add(1), {
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
                decimals: 1,
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
        const AmountToMint = BigNumber.from(10).mul(ONE_TOKEN_FACTOR)

        // Get the initial reserve amount
        const initialReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalReserve = (
            await reserveFacet.getReserveAmount({
                gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
            })
        ).sub(AmountToMint)
        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve.add(1), {
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
                decimals: 3,
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
        const AmountToMint = BigNumber.from(10).mul(THREE_TOKEN_FACTOR)

        // Get the initial reserve amount
        const initialReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin tokens to previously associated account
        const mintResponse = await cashInFacet.mint(operator.address, AmountToMint, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()

        // Check the reserve account : success
        await delay({ time: 1, unit: 'sec' })
        const finalReserve = (
            await reserveFacet.getReserveAmount({
                gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
            })
        ).sub(AmountToMint)
        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await reserveFacet.getReserveAmount({
            gasLimit: GAS_LIMIT.hederaTokenManager.getReserveAmount,
        })

        // Cashin more tokens than reserve amount: fail
        const mintResponse = await cashInFacet.mint(operator.address, totalReserve.add(1), {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(new ValidateTxResponseCommand({ txResponse: mintResponse }).execute()).to.be.rejectedWith(Error)
    })
})
