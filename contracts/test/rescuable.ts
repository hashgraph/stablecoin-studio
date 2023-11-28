import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import {
    delay,
    getBalanceOf,
    getHBARBalanceOf,
    grantRole,
    hasRole,
    rescue,
    rescueHBAR,
    revokeRole,
    transferHBAR,
} from '../scripts/contractsMethods'
import { RESCUE_ROLE } from '../scripts/constants'
import { associateToken, getContractInfo } from '../scripts/utils'
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
    TOKEN_FACTOR,
    TOKEN_MEMO,
    TOKEN_NAME,
    TOKEN_SYMBOL,
} from './shared/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let token: ContractId

const HBARDecimals = 8
const HBARFactor = BigNumber.from(10).pow(HBARDecimals)
const HBARInitialAmount = BigNumber.from(100).mul(HBARFactor)

describe('Rescue Tests', function () {
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
        })

        proxyAddress = result[0]
        token = result[8]

        await transferHBAR(
            operatorAccount,
            proxyAddress.toString(),
            HBARInitialAmount,
            operatorClient,
            false
        )

        await delay(3000)
    })

    it('Admin account can grant and revoke rescue role to an account', async function () {
        // Admin grants rescue role : success
        let result = await hasRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes rescue role : success
        await revokeRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant rescue role to an account', async function () {
        // Non Admin grants rescue role : fail
        await expect(
            grantRole(
                RESCUE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke rescue role to an account', async function () {
        // Non Admin revokes rescue role : fail
        await grantRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                RESCUE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('Should rescue 10 tokens', async function () {
        const tenTokens = BigNumber.from(10).mul(TOKEN_FACTOR)

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

        // rescue some tokens
        await rescue(proxyAddress, tenTokens, operatorClient)

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
            initialTokenOwnerBalance.sub(tenTokens)
        const expectedClientBalance = initialClientBalance.add(tenTokens)

        expect(finalTokenOwnerBalance.toString()).to.equals(
            expectedTokenOwnerBalance.toString()
        )
        expect(finalClientBalance.toString()).to.equals(
            expectedClientBalance.toString()
        )
    })

    it('we cannot rescue more tokens than the token owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address,
            false,
            false
        )

        // Rescue TokenOwnerBalance + 1 : fail
        await expect(
            rescue(proxyAddress, TokenOwnerBalance.add(1), operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User without rescue role cannot rescue tokens', async function () {
        // Account without rescue role, rescues tokens : fail
        await expect(
            rescue(proxyAddress, BigNumber.from(1), nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User with granted rescue role can rescue tokens', async function () {
        // Retrieve original balances
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
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Grant rescue role to account
        await grantRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Associate account to token
        await associateToken(
            token.toString(),
            nonOperatorAccount,
            nonOperatorClient
        )

        // Rescue tokens with newly granted account
        await rescue(proxyAddress, ONE_TOKEN, nonOperatorClient)

        // Check final balances : success
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
            nonOperatorAccount,
            nonOperatorIsE25519
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

        // Revoke rescue role to account
        await revokeRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('Should rescue 10 HBAR', async function () {
        // Get the initial balance of the token owner and client
        const AmountToRescue = BigNumber.from(10).mul(HBARFactor)
        const initialTokenOwnerBalance = await getHBARBalanceOf(
            proxyAddress.toString(),
            operatorClient,
            false,
            false
        )
        const initialClientBalance = await getHBARBalanceOf(
            operatorAccount,
            operatorClient,
            true,
            false
        )

        // rescue some tokens
        await rescueHBAR(proxyAddress, AmountToRescue, operatorClient)
        await delay(3000)

        // check new balances : success
        const finalTokenOwnerBalance = await getHBARBalanceOf(
            proxyAddress.toString(),
            operatorClient,
            false,
            false
        )
        const finalClientBalance = await getHBARBalanceOf(
            operatorAccount,
            operatorClient,
            true,
            false
        )

        const expectedTokenOwnerBalance =
            initialTokenOwnerBalance.sub(AmountToRescue)
        const diffClientBalance = finalClientBalance.sub(initialClientBalance)

        expect(finalTokenOwnerBalance.toString()).to.equals(
            expectedTokenOwnerBalance.toString()
        )
        expect(diffClientBalance.gt(BigNumber.from(0))).to.be.true
    })

    it('we cannot rescue more HBAR than the owner balance', async function () {
        // Get the initial balance of the token owner
        const TokenOwnerBalance = await getHBARBalanceOf(
            proxyAddress.toString(),
            operatorClient,
            false,
            false
        )

        // Rescue TokenOwnerBalance + 1 : fail
        await expect(
            rescueHBAR(proxyAddress, TokenOwnerBalance.add(1), operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User without rescue role cannot rescue HBAR', async function () {
        // Account without rescue role, rescues HBAR : fail
        await expect(
            rescueHBAR(proxyAddress, BigNumber.from(1), nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User with granted rescue role can rescue HBAR', async function () {
        const AmountToRescue = BigNumber.from(10).mul(HBARFactor)
        // Retrieve original balances
        const initialTokenOwnerBalance = await getHBARBalanceOf(
            proxyAddress.toString(),
            operatorClient,
            false,
            false
        )
        const initialClientBalance = await getHBARBalanceOf(
            nonOperatorAccount,
            operatorClient,
            true,
            false
        )

        // Grant rescue role to account
        await grantRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Rescue tokens with newly granted account
        await rescueHBAR(proxyAddress, AmountToRescue, nonOperatorClient)
        await delay(3000)

        // Check final balances : success
        const finalTokenOwnerBalance = await getHBARBalanceOf(
            proxyAddress.toString(),
            operatorClient,
            false,
            false
        )
        const finalClientBalance = await getHBARBalanceOf(
            nonOperatorAccount,
            operatorClient,
            true,
            false
        )

        const expectedTokenOwnerBalance =
            initialTokenOwnerBalance.sub(AmountToRescue)
        const diffClientBalance = finalClientBalance.sub(initialClientBalance)

        expect(finalTokenOwnerBalance.toString()).to.equals(
            expectedTokenOwnerBalance.toString()
        )
        expect(diffClientBalance.gt(BigNumber.from(0))).to.be.true

        // Revoke rescue role to account
        await revokeRole(
            RESCUE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })
})
