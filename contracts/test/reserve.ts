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
} from '../scripts/contractsMethods'

import { clientId, toEvmAddress } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let stableCoinAddress: ContractId

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

describe('Reserve Tests', function() {
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

    it('Test #1', async function() {
        const amount = BigNumber.from(1)

        // associate a token to an account : success
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // We mint tokens to that account and check supply and balance: success
        await Mint(
            proxyAddress,
            amount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // dissociate the token from the account when balance is not 0 : fail
        await expect(
            dissociateToken(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // We wipe amount in account to be able to dissociate
        const Balance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await Wipe(
            proxyAddress,
            Balance,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // dissociate the token from the account : success
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // associate a token to an account using another account : fail
        await expect(
            associateToken(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // associate a token to an account again : success
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // dissociate the token from the account using another account : fail
        await expect(
            dissociateToken(
                proxyAddress,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // reset
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })
})
