import '@hashgraph/hardhat-hethers'
import { BigNumber } from 'ethers'

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

import { clientId } from '../scripts/utils'

import {
    grantRole,
    revokeRole,
    hasRole,
    Burn,
    getTotalSupply,
} from '../scripts/contractsMethods'
import { BURN_ROLE } from '../scripts/constants'

let proxyAddress: any

let operatorClient: any
let nonOperatorClient: any
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let nonOperatorPriKey: string
let operatorPubKey: string
let nonOperatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

let client1: any
let client1account: string
let client1privatekey: string
let client1publickey: string
let client1isED25519Type: boolean

let client2: any
let client2account: string
let client2privatekey: string
let client2publickey: string
let client2isED25519Type: boolean

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 3
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(100).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('Burn Tests', function() {
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
        const result = await deployContractsWithSDK(
            TokenName,
            TokenSymbol,
            TokenDecimals,
            INIT_SUPPLY.toString(),
            MAX_SUPPLY.toString(),
            TokenMemo,
            operatorAccount,
            operatorPriKey,
            operatorPubKey,
            operatorIsE25519
        )

        proxyAddress = result[0]
    })

    it('Admin account can grant and revoke burnable role to an account', async function() {
        // Admin grants burn role : success
        let result = await hasRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes burn role : success
        await revokeRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant burnable role to an account', async function() {
        // Non Admin grants burn role : fail
        await expect(
            grantRole(
                BURN_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke burnable role to an account', async function() {
        // Non Admin revokes burn role : fail
        await grantRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                BURN_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('Can burn 10 tokens from the treasury account having 100 tokens', async function() {
        const tokensToBurn = INIT_SUPPLY.div(10)

        // Get the initial total supply and treasury account's balanceOf
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        // burn some tokens
        await Burn(proxyAddress, tokensToBurn, operatorClient)

        // check new total supply and balance of treasury account : success
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
    })

    it('Cannot burn more tokens than the treasury account has', async function() {
        // Retrieve original total supply
        const currentTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        // burn more tokens than original total supply : fail
        await expect(
            Burn(proxyAddress, currentTotalSupply.add(1), operatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User without burn role cannot burn tokens', async function() {
        // Account without burn role, burns tokens : fail
        await expect(
            Burn(proxyAddress, BigNumber.from(1), nonOperatorClient)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('User with granted burn role can burn tokens', async function() {
        const tokensToBurn = BigNumber.from(1)

        // Retrieve original total supply
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        // Grant burn role to account
        await grantRole(
            BURN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Burn tokens with newly granted account
        await Burn(proxyAddress, tokensToBurn, nonOperatorClient)

        // Check final total supply and treasury account's balanceOf : success
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const expectedTotalSupply = initialTotalSupply.sub(tokensToBurn)

        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
    })
})
