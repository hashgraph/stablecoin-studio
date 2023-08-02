import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import {
    deployContractsWithSDK,
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    deployHederaReserve,
} from '../scripts/deploy'
import { Mint } from '../scripts/contractsMethods'
import {
    getReserveAddress,
    updateDataFeed,
    getReserveAmount,
} from '../scripts/contractsMethods'
import { clientId, getContractInfo } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

let operatorClient: Client
let operatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const OneTokenDecimals = 1
const TwoTokenDecimals = 2
const ThreeTokenDecimals = 3
const ReserveDecimal = 2
const INIT_AMOUNT_100 = 100
const INIT_AMOUNT_1000 = 1000
const OneTokenFactor = BigNumber.from(10).pow(OneTokenDecimals)
const TwoTokenFactor = BigNumber.from(10).pow(TwoTokenDecimals)
const ThreeTokenFactor = BigNumber.from(10).pow(ThreeTokenDecimals)
const INIT_SUPPLY_ONE_DECIMALS =
    BigNumber.from(INIT_AMOUNT_100).mul(OneTokenFactor)
const MAX_SUPPLY_ONE_DECIMALS = BigNumber.from(1000).mul(OneTokenFactor)
const INIT_SUPPLY_TWO_DECIMALS =
    BigNumber.from(INIT_AMOUNT_100).mul(TwoTokenFactor)
const MAX_SUPPLY_TWO_DECIMALS = BigNumber.from(1000).mul(TwoTokenFactor)
const INIT_SUPPLY_THREE_DECIMALS =
    BigNumber.from(INIT_AMOUNT_100).mul(ThreeTokenFactor)
const MAX_SUPPLY_THREE_DECIMALS = BigNumber.from(1000).mul(ThreeTokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'
const INIT_RESERVE_100 = BigNumber.from(10)
    .pow(ReserveDecimal)
    .mul(BigNumber.from(INIT_AMOUNT_100))
const INIT_RESERVE_1000 = BigNumber.from(10)
    .pow(ReserveDecimal)
    .mul(BigNumber.from(INIT_AMOUNT_1000))
let hederaReserveProxy: ContractId

describe('Reserve Tests', function () {
    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)

        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: ThreeTokenDecimals,
            initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
            maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE_100.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })

    it('Get getReserveAmount', async () => {
        const reserve = await getReserveAmount(proxyAddress, operatorClient)
        expect(reserve).to.equals(INIT_RESERVE_100.toString())
    })

    it('Get datafeed', async () => {
        const datafeed = await getReserveAddress(proxyAddress, operatorClient)
        expect(datafeed.toUpperCase()).not.to.equals(
            '0x' +
                (
                    await getContractInfo(hederaReserveProxy.toString())
                ).evm_address.toUpperCase()
        )
    })

    it('Update datafeed', async () => {
        const beforeDataFeed = await getReserveAddress(
            proxyAddress,
            operatorClient
        )
        const beforeReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )
        const newReserve = beforeReserve.add(
            BigNumber.from('100').mul(ThreeTokenFactor)
        )
        const [newDataFeed, ...others] = await deployHederaReserve(
            newReserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        await updateDataFeed(newDataFeed, proxyAddress, operatorClient)
        const afterDataFeed = await getReserveAddress(
            proxyAddress,
            operatorClient
        )
        const afterReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        expect(beforeDataFeed).not.to.equals(afterDataFeed)
        expect(beforeReserve).not.to.equals(afterReserve)
        expect(afterReserve).to.equals(newReserve)
    })
})

describe('Reserve Tests with reserve and token with same Decimals', function () {
    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)

        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: TwoTokenDecimals,
            initialSupply: INIT_SUPPLY_TWO_DECIMALS.toString(),
            maxSupply: MAX_SUPPLY_TWO_DECIMALS.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE_1000.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(TwoTokenFactor)

        // Get the initial reserve amount
        const initialReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        // Cashin tokens to previously associated account
        await Mint(
            proxyAddress,
            AmountToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Check the reserve account : success
        const finalReserve = (
            await getReserveAmount(proxyAddress, operatorClient)
        ).sub(AmountToMint)

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(
            expectedTotalReserve.toString()
        )
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )
        // Cashin more tokens than reserve amount: fail
        await expect(
            Mint(
                proxyAddress,
                totalReserve.add(1),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})

describe('Reserve Tests with reserve decimals higher than token decimals', function () {
    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)

        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: OneTokenDecimals,
            initialSupply: INIT_SUPPLY_ONE_DECIMALS.toString(),
            maxSupply: MAX_SUPPLY_ONE_DECIMALS.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE_100.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(OneTokenFactor)

        // Get the initial reserve amount
        const initialReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        // Cashin tokens to previously associated account
        await Mint(
            proxyAddress,
            AmountToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Check the reserve account : success
        const finalReserve = (
            await getReserveAmount(proxyAddress, operatorClient)
        ).sub(AmountToMint)

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(
            expectedTotalReserve.toString()
        )
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )
        // Cashin more tokens than reserve amount: fail
        await expect(
            Mint(
                proxyAddress,
                totalReserve.add(1),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})

describe('Reserve Tests with reserve decimals lower than token decimals', function () {
    before(async function () {
        // Generate Client 1 and Client 2
        const [
            client1,
            client1account,
            client1privatekey,
            client1publickey,
            client1isED25519Type,
            client2,
            client2account,
            client2privatekey,
            client2publickey,
            client2isED25519Type,
        ] = initializeClients()

        operatorClient = getOperatorClient(client1, client2, clientId)

        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        operatorPriKey = getOperatorPrivateKey(
            client1privatekey,
            client2privatekey,
            clientId
        )
        operatorPubKey = getOperatorPublicKey(
            client1publickey,
            client2publickey,
            clientId
        )
        operatorIsE25519 = getOperatorE25519(
            client1isED25519Type,
            client2isED25519Type,
            clientId
        )

        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: ThreeTokenDecimals,
            initialSupply: INIT_SUPPLY_THREE_DECIMALS.toString(),
            maxSupply: MAX_SUPPLY_THREE_DECIMALS.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE_1000.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })

    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(ThreeTokenFactor)

        // Get the initial reserve amount
        const initialReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        // Cashin tokens to previously associated account
        await Mint(
            proxyAddress,
            AmountToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Check the reserve account : success
        const finalReserve = (
            await getReserveAmount(proxyAddress, operatorClient)
        ).sub(AmountToMint)

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(
            expectedTotalReserve.toString()
        )
    })

    it('Can not mint more tokens than reserve', async function () {
        // Retrieve current reserve amount
        const totalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )
        // Cashin more tokens than reserve amount: fail
        await expect(
            Mint(
                proxyAddress,
                totalReserve.add(1),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})
