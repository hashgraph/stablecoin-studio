import '@hashgraph/hardhat-hethers'
import { BigNumber } from 'ethers'
import { deployContractsWithSDK } from '../scripts/deploy'
import { getBalanceOf, getTotalSupply, grantRole, hasRole, Mint, revokeRole, Wipe } from '../scripts/contractsMethods'
import { WIPE_ROLE } from '../scripts/constants'
import { ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    INIT_SUPPLY,
    MAX_SUPPLY,
    nonOperatorAccount,
    nonOperatorClient,
    nonOperatorIsE25519,
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
} from './shared'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId

const TokensToMint = BigNumber.from(20).mul(TOKEN_FACTOR)
const TokensToWipe = BigNumber.from(10).mul(TOKEN_FACTOR)

describe('Wipe Tests', function () {
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
            initialAmountDataFeed: INIT_SUPPLY.add(BigNumber.from('100000')).toString(),
        })

        proxyAddress = result[0]
    })

    it('Account with WIPE role can wipe 10 tokens from an account with 20 tokens', async function () {
        // Mint 20 tokens
        await Mint(proxyAddress, TokensToMint, operatorClient, operatorAccount, operatorIsE25519)

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await getTotalSupply(proxyAddress, operatorClient)
        const initialBalanceOf = await getBalanceOf(proxyAddress, operatorClient, operatorAccount, operatorIsE25519)

        // Wipe 10 tokens
        await Wipe(proxyAddress, TokensToWipe, operatorClient, operatorAccount, operatorIsE25519)

        // Check balance of account and total supply : success
        const finalTotalSupply = await getTotalSupply(proxyAddress, operatorClient)
        const finalBalanceOf = await getBalanceOf(proxyAddress, operatorClient, operatorAccount, operatorIsE25519)
        const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe)
        const expectedBalanceOf = initialBalanceOf.sub(TokensToWipe)

        expect(finalTotalSupply.toString()).to.equals(expectedTotalSupply.toString())
        expect(finalBalanceOf.toString()).to.equals(expectedBalanceOf.toString())
    })

    it("Account with WIPE role cannot wipe more than account's balance", async function () {
        // Mint 20 tokens
        await Mint(proxyAddress, TokensToMint, operatorClient, operatorAccount, operatorIsE25519)

        // Get the current balance for account
        const result = await getBalanceOf(proxyAddress, operatorClient, operatorAccount, operatorIsE25519)

        // Wipe more than account's balance : fail
        await expect(
            Wipe(proxyAddress, result.add(1), operatorClient, operatorAccount, operatorIsE25519)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Account with WIPE role cannot wipe a negative amount', async function () {
        // Wipe more than account's balance : fail
        await expect(
            Wipe(proxyAddress, BigNumber.from('-1'), operatorClient, operatorAccount, operatorIsE25519)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Account without WIPE role cannot wipe tokens', async function () {
        // Mint 20 tokens
        await Mint(proxyAddress, TokensToMint, operatorClient, operatorAccount, operatorIsE25519)

        // Wipe with account that does not have the wipe role: fail
        await expect(
            Wipe(proxyAddress, BigNumber.from(1), nonOperatorClient, operatorAccount, operatorIsE25519)
        ).to.eventually.be.rejectedWith(Error)
    })
})
