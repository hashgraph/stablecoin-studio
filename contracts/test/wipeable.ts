import '@hashgraph/hardhat-hethers'
require('@hashgraph/sdk')
import { BigNumber, Contract } from 'ethers'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect

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
    getNonOperatorPrivateKey,
    getNonOperatorPublicKey,
    getNonOperatorE25519,
} from '../scripts/deploy'
import {
    grantRole,
    revokeRole,
    hasRole,
    Mint,
    Wipe,
    getBalanceOf,
    getTotalSupply,
} from '../scripts/contractsMethods'
import { WIPE_ROLE } from '../scripts/constants'

import { clientId } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'

let proxyAddress: ContractId

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
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(6000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('Wipe Tests', function() {
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
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('100000')
            ).toString(),
        })

        proxyAddress = result[0]
    })

    it('Admin account can grant and revoke wipe role to an account', async function() {
        // Admin grants wipe role : success
        let result = await hasRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes wipe role : success
        await revokeRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant wipe role to an account', async function() {
        // Non Admin grants wipe role : fail
        await expect(
            grantRole(
                WIPE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke wipe role to an account', async function() {
        // Non Admin revokes wipe role : fail
        await grantRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                WIPE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('wipe 10 tokens from an account with 20 tokens', async function() {
        const TokensToMint = BigNumber.from(20).mul(TokenFactor)
        const TokensToWipe = BigNumber.from(10).mul(TokenFactor)

        // Mint 20 tokens
        await Mint(
            proxyAddress,
            TokensToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const initialBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Wipe 10 tokens
        await Wipe(
            proxyAddress,
            TokensToWipe,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Check balance of account and total supply : success
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const finalBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe)
        const expectedBalanceOf = initialBalanceOf.sub(TokensToWipe)

        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
        expect(finalBalanceOf.toString()).to.equals(
            expectedBalanceOf.toString()
        )
    })

    it("Wiping more than account's balance", async function() {
        const TokensToMint = BigNumber.from(20).mul(TokenFactor)

        // Mint 20 tokens
        await Mint(
            proxyAddress,
            TokensToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Get the current balance for account
        const result = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Wipe more than account's balance : fail
        await expect(
            Wipe(
                proxyAddress,
                result.add(1),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Wiping from account without the wipe role', async function() {
        const TokensToMint = BigNumber.from(20).mul(TokenFactor)

        // Mint 20 tokens
        await Mint(
            proxyAddress,
            TokensToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Wipe with account that does not have the wipe role: fail
        await expect(
            Wipe(
                proxyAddress,
                BigNumber.from(1),
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User with granted wipe role can wipe tokens', async function() {
        const TokensToMint = BigNumber.from(20).mul(TokenFactor)
        const TokensToWipe = BigNumber.from(1)

        // Mint 20 tokens
        await Mint(
            proxyAddress,
            TokensToMint,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Retrieve original total supply
        const initialBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        // Grant wipe role to account
        await grantRole(
            WIPE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Wipe tokens with newly granted account
        await Wipe(
            proxyAddress,
            TokensToWipe,
            nonOperatorClient,
            operatorAccount,
            operatorIsE25519
        )

        // Check final total supply and treasury account's balanceOf : success
        const finalBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const expectedFinalBalanceOf = initialBalanceOf.sub(TokensToWipe)
        const expectedTotalSupply = initialTotalSupply.sub(TokensToWipe)

        expect(finalBalanceOf.toString()).to.equals(
            expectedFinalBalanceOf.toString()
        )
        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
    })
})
