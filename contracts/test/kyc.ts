import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    getBalanceOf,
    grantKyc,
    grantRole,
    hasRole,
    Mint,
    rescue,
    revokeKyc,
    revokeRole,
    Wipe,
} from '../scripts/contractsMethods'
import { KYC_ROLE } from '../scripts/constants'
import {
    associateToken,
    dissociateToken,
    getContractInfo,
    transferToken,
} from '../scripts/utils'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorAccount,
    nonOperatorClient,
    nonOperatorIsE25519,
    ONE_TOKEN,
    operatorAccount,
    operatorClient,
    operatorIsE25519,
    operatorPriKey,
    operatorPubKey,
    TOKEN_DECIMALS,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

describe('KYC Tests', function () {
    before(async function () {
        // Deploy Token using Client
        const result = await deployContractsWithSDK({
            name: TOKEN_NAME,
            symbol: TOKEN_SYMBOL,
            decimals: TOKEN_DECIMALS,
            initialSupply: INIT_SUPPLY.toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TOKEN_MEMO,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
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
        await expect(
            Mint(
                proxyAddress,
                ONE_TOKEN,
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with kyc can cash in', async () => {
        await expect(
            Mint(
                proxyAddress,
                ONE_TOKEN,
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
            ONE_TOKEN,
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
        expect(balanceBefore.add(ONE_TOKEN).toString()).to.equals(
            balanceAfter.toString()
        )

        // RESET
        await Wipe(
            proxyAddress,
            ONE_TOKEN,
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
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await Mint(
            proxyAddress,
            ONE_TOKEN,
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
                ONE_TOKEN,
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
            ONE_TOKEN,
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
        await grantKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        await Mint(
            proxyAddress,
            ONE_TOKEN,
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
            ONE_TOKEN,
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
        expect(balanceBeforeWipe.sub(ONE_TOKEN).toString()).to.equals(
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
            ONE_TOKEN,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await expect(
            transferToken(
                token.toString(),
                nonOperatorAccount,
                ONE_TOKEN,
                operatorClient
            )
        ).to.eventually.be.rejectedWith(Error)

        // RESET
        await Wipe(
            proxyAddress,
            ONE_TOKEN,
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
            ONE_TOKEN,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await transferToken(
            token.toString(),
            nonOperatorAccount,
            ONE_TOKEN,
            operatorClient
        )
        const balance = await getBalanceOf(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        expect(balance.toString()).to.equal(ONE_TOKEN.toString())
        // RESET
        await Wipe(
            proxyAddress,
            ONE_TOKEN,
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
        // rescue some tokens
        await expect(
            rescue(proxyAddress, ONE_TOKEN, operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Account with granted kyc can rescue tokens', async function () {
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
        await rescue(proxyAddress, ONE_TOKEN, operatorClient)

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
            initialTokenOwnerBalance.sub(ONE_TOKEN)
        const expectedClientBalance = initialClientBalance.add(ONE_TOKEN)

        expect(finalTokenOwnerBalance.toString()).to.equals(
            expectedTokenOwnerBalance.toString()
        )
        expect(finalClientBalance.toString()).to.equals(
            expectedClientBalance.toString()
        )
    })

    it('Account with revoked kyc can not rescue tokens', async function () {
        // revoke kyc to client for the token
        await revokeKyc(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            operatorClient
        )

        // rescue some tokens
        await expect(
            rescue(proxyAddress, ONE_TOKEN, operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })
})
