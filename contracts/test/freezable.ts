import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
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
import {
    grantRole,
    revokeRole,
    hasRole,
    freeze,
    unfreeze,
    rescue,
    getBalanceOf,
} from '../scripts/contractsMethods'
import { FREEZE_ROLE } from '../scripts/constants'

import { clientId } from '../scripts/utils'

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
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('Freeze Tests', function() {
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

    it('Admin account can grant and revoke freeze role to an account', async function() {
        // Admin grants freeze role : success
        let result = await hasRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)

        await grantRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        result = await hasRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(true)

        // Admin revokes freeze role : success
        await revokeRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await hasRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result).to.equals(false)
    })

    it('Non Admin account can not grant freeze role to an account', async function() {
        // Non Admin grants freeze role : fail
        await expect(
            grantRole(
                FREEZE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Non Admin account can not revoke freeze role to an account', async function() {
        // Non Admin revokes freeze role : fail
        await grantRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeRole(
                FREEZE_ROLE,
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it("An account without freeze role can't freeze transfers of the token for the account", async function() {
        await expect(
            freeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it("An account without freeze role can't unfreeze transfers of the token for the account", async function() {
        await expect(
            unfreeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with freeze role can freeze transfers of the token for the account', async function() {
        await grantRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await expect(
            freeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).not.to.eventually.be.rejectedWith(Error)

        //Reset status
        await unfreeze(
            proxyAddress,
            nonOperatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await revokeRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with freeze role can unfreeze transfers of the token for the account', async function() {
        await grantRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        await expect(
            unfreeze(
                proxyAddress,
                nonOperatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).not.to.eventually.be.rejectedWith(Error)

        //Reset status
        await revokeRole(
            FREEZE_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('When freezing transfers of the token for the account a rescue operation can not be performed', async function() {
        const AmountToRescue = BigNumber.from(1).mul(TokenFactor)

        await freeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await expect(
            rescue(proxyAddress, AmountToRescue, operatorClient)
        ).to.eventually.be.rejectedWith(Error)

        //Reset status
        await unfreeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
    })

    it('When unfreezing transfers of the token for the account a rescue operation can be performed', async function() {
        const AmountToRescue = BigNumber.from(1).mul(TokenFactor)

        await freeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await unfreeze(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        await rescue(proxyAddress, AmountToRescue, operatorClient)
        const balance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )
        expect(balance.toString()).to.equals(AmountToRescue.toString())
    })
})
