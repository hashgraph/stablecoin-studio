import { BigNumber } from 'ethers'
import {
    deployContractsWithSDK,
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
} from '../scripts/deploy'
import {
    name,
    symbol,
    decimals,
    initialize,
    associateToken,
    dissociateToken,
    Mint,
    Wipe,
    getTotalSupply,
    getBalanceOf,
    getTokenAddress,
    upgradeTo,
    admin,
    changeAdmin,
    owner,
    upgrade,
    changeProxyAdmin,
    transferOwnership,
    getProxyAdmin,
    getProxyImplementation,
    approve,
    allowance,
    transferFrom,
    Burn,
    transfer,
    grantKyc,
    revokeKyc,
} from '../scripts/contractsMethods'
import { clientId, toEvmAddress } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import {
    HederaERC20ProxyAdmin__factory,
    HederaERC20Proxy__factory,
} from '../typechain-types'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let stableCoinAddress: ContractId
let reserveProxy: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('HederaERC20 Tests', function() {
    before(async function() {
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
        nonOperatorClient = getNonOperatorClient(client1, client2, clientId)
        operatorAccount = getOperatorAccount(
            client1account,
            client2account,
            clientId
        )
        nonOperatorAccount = getNonOperatorAccount(
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
        nonOperatorIsE25519 = getNonOperatorE25519(
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
            initialAmountDataFeed: BigNumber.from('2000').toString(),
            addKyc: true,
        })

        proxyAddress = result[0]
    })

    it('An account without kyc can not cash in', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await expect(
            Mint(
                proxyAddress,
                amount,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with kyc can cash in', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await expect(
            Mint(
                proxyAddress,
                amount,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        const balanceBefore = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        const balanceAfter = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        expect(balanceBefore.add(amount).toString()).to.equals(
            balanceAfter.toString()
        )

        // RESET
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const balanceAfterWipe = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        expect(balanceAfterWipe.toString()).to.equals('0')
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
    })

    it('An account without kyc can not wipe', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)

        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await expect(
            Wipe(
                proxyAddress,
                amount,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // RESET
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const balanceAfterWipe = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        expect(balanceAfterWipe.toString()).to.equals('0')
    })

    it('An account with kyc can wipe', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)

        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        const balanceBeforeWipe = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const balanceAfterWipe = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        expect(balanceBeforeWipe.sub(amount).toString()).to.equals(
            balanceAfterWipe.toString()
        )

        // RESET

        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
    })

    it('An account with kyc can not transfer tokens to an account without kyc', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await expect(
            transfer(
                proxyAddress,
                nonOperatorAccount,
                nonOperatorIsE25519,
                amount,
                operatorClient
            )
        ).to.eventually.be.rejectedWith(Error)

        // RESET
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
    })

    it('An account with kyc can transfer token to other account with kyc', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await grantKyc(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )
        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await transfer(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            amount,
            operatorClient
        )
        const balance = await getBalanceOf(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        expect(balance.toString()).to.equal(amount.toString())
        // RESET
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await revokeKyc(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with kyc, approve to transfer to other account without kyc', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await approve(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            amount,
            operatorClient
        )
        await expect(
            transferFrom(
                proxyAddress,
                operatorAccount,
                operatorIsE25519,
                nonOperatorAccount,
                nonOperatorIsE25519,
                amount,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)

        // RESET
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await approve(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            BigNumber.from(0),
            operatorClient
        )
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it.only('An account with kyc, approve to transfer to other account with kyc', async () => {
        const amount = BigNumber.from(1).mul(TokenFactor)
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await grantKyc(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )
        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await approve(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            amount,
            operatorClient
        )
        await transferFrom(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            nonOperatorAccount,
            nonOperatorIsE25519,
            amount,
            nonOperatorClient
        )

        // RESET
        await Wipe(
            proxyAddress,
            amount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
        await revokeKyc(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })
})
