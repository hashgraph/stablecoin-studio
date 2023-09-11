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
    Mint,
    Wipe,
    getBalanceOf,
    rescue,
    grantKyc,
    revokeKyc,
    hasRole,
    grantRole,
    revokeRole,
} from '../scripts/contractsMethods'
import { KYC_ROLE } from '../scripts/constants'
import {
    clientId,
    transferToken,
    associateToken,
    dissociateToken,
    getContractInfo,
} from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean
let token: ContractId

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stablecoin'

describe('KYC Tests', function () {
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
            grantKYCToOriginalSender: true,
            addKyc: true,
        })

        proxyAddress = result[0]
        token = result[8]
    })

    it('Admin account can grant and revoke kyc role to an account', async function () {
        // Admin grants pause role : success
        let result = await hasRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes KYC role : success
        await revokeRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant kyc role to an account', async function () {
        // Non Admin grants KYC role : fail
        await expect(
            grantRole(
                KYC_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke kyc role to an account', async function () {
        // Non Admin revokes KYC role : fail
        await grantRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                KYC_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            KYC_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it("An account without kyc role can't grant kyc to an account for a token", async function () {
        await expect(
            grantKyc(
                proxyAddress,
                operatorAccount,
                operatorIsE25519,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it("An account without kyc role can't revoke kyc to an account for a token", async function () {
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await expect(
            revokeKyc(
                proxyAddress,
                operatorAccount,
                operatorIsE25519,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset kyc
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )
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
            token.toString(),
            nonOperatorAccount,
            nonOperatorClient
        )

        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await expect(
            transferToken(
                token.toString(),
                nonOperatorAccount,
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
        await transferToken(
            token.toString(),
            nonOperatorAccount,
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
            token.toString(),
            nonOperatorAccount,
            nonOperatorClient
        )
    })

    it('Account without kyc can not rescue tokens', async function () {
        const AmountToRescue = BigNumber.from(10).mul(TokenFactor)

        // rescue some tokens
        await expect(
            rescue(proxyAddress, AmountToRescue, operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Account with granted kyc can rescue tokens', async function () {
        const AmountToRescue = BigNumber.from(10).mul(TokenFactor)

        // Get the initial balance of the token owner and client
        const initialTokenOwnerBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address,
            false,
            false
        )

        const initialClientBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // grant kyc to client for the token
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        // rescue some tokens
        await rescue(proxyAddress, AmountToRescue, operatorClient)

        // check new balances : success
        const finalTokenOwnerBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address,
            false,
            false
        )
        const finalClientBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        const expectedTokenOwnerBalance =
            initialTokenOwnerBalance.sub(AmountToRescue)
        const expectedClientBalance = initialClientBalance.add(AmountToRescue)

        expect(finalTokenOwnerBalance.toString()).to.equals(
            expectedTokenOwnerBalance.toString()
        )
        expect(finalClientBalance.toString()).to.equals(
            expectedClientBalance.toString()
        )
    })

    it('Account with revoked kyc can not rescue tokens', async function () {
        const AmountToRescue = BigNumber.from(10).mul(TokenFactor)

        // revoke kyc to client for the token
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        // rescue some tokens
        await expect(
            rescue(proxyAddress, AmountToRescue, operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })
})
