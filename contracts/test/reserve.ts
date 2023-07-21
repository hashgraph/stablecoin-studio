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
import {
    Mint,
} from '../scripts/contractsMethods'
import {
    getReserveAddress,
    updateDataFeed,
    getReserveAmount,
} from '../scripts/contractsMethods'
import { clientId } from '../scripts/utils'
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
const TokenDecimals = 3
const ReserveDecimal = 2
const INIT_AMOUNT = 100
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(INIT_AMOUNT).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'
const INIT_RESERVE = BigNumber.from(INIT_AMOUNT).pow(ReserveDecimal)
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
            decimals: TokenDecimals,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })

    it('Get getReserveAmount', async () => {
        const reserve = await getReserveAmount(proxyAddress, operatorClient)
        expect(reserve).to.equals(INIT_RESERVE.toString())
    })

    it('Get datafeed', async () => {
        const datafeed = await getReserveAddress(proxyAddress, operatorClient)
        expect(datafeed.toUpperCase()).not.to.equals(
            '0x' + hederaReserveProxy.toSolidityAddress().toUpperCase()
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
            BigNumber.from('100').mul(TokenFactor)
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
            decimals: 2,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })
    
    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(TokenFactor);

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
        const finalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
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
            decimals: 1,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })
    
    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(TokenFactor);

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
        const finalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
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
            decimals: 3,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_RESERVE.toString(),
        })

        proxyAddress = result[0]
        hederaReserveProxy = result[7]
    })
    
    it('Can Mint less tokens than reserve', async function () {
        const AmountToMint = BigNumber.from(10).mul(TokenFactor);

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
        const finalReserve = await getReserveAmount(
            proxyAddress,
            operatorClient
        )

        const expectedTotalReserve = initialReserve.sub(AmountToMint)
        expect(finalReserve.toString()).to.equals(expectedTotalReserve.toString())
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
