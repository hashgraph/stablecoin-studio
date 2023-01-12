import '@hashgraph/hardhat-hethers'
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
    decreaseSupplierAllowance,
    grantSupplierRole,
    grantUnlimitedSupplierRole,
    increaseSupplierAllowance,
    isUnlimitedSupplierAllowance,
    resetSupplierAllowance,
    revokeSupplierRole,
    supplierAllowance,
    associateToken,
    getTotalSupply,
    getBalanceOf,
    Mint,
    hasRole,
} from '../scripts/contractsMethods'
import { CASHIN_ROLE } from '../scripts/constants'

import { clientId } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
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

const TokenName = 'MIDAS'
const TokenSymbol = 'MD'
const TokenDecimals = 6
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(0).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('Only Admin can grant, revoke, increase, decrease and reset cashin role (limited and unlimited)', function() {
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
                BigNumber.from('150').mul(TokenFactor)
            ).toString(),
        })

        proxyAddress = result[0]
    })

    it('Admin account can grant and revoke supplier(s) role to an account', async function() {
        const cashInLimit = BigNumber.from(1)

        // Admin grants limited supplier role : success
        let Role = await hasRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(Role).to.equals(false)
        let result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result.toString()).to.eq('0')

        await grantSupplierRole(
            proxyAddress,
            cashInLimit,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        Role = await hasRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(Role).to.equals(true)
        result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result.toString()).to.eq(cashInLimit.toString())

        // Admin revokes limited supplier role : success
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        Role = await hasRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(Role).to.equals(false)
        result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result.toString()).to.eq('0')

        // Admin grants unlimited supplier role : success
        let isUnlimited = await isUnlimitedSupplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(isUnlimited).to.eq(false)

        await grantUnlimitedSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        isUnlimited = await isUnlimitedSupplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(isUnlimited).to.eq(true)
        Role = await hasRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(Role).to.equals(true)

        // Admin revokes unlimited supplier role : success
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        isUnlimited = await isUnlimitedSupplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(isUnlimited).to.eq(false)
        Role = await hasRole(
            CASHIN_ROLE,
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(Role).to.equals(false)
    })

    it('Admin account can increase, decrease and reset supplier(s) amount', async function() {
        const cashInLimit = BigNumber.from(1)
        const amount = BigNumber.from(1)

        // Admin increases supplier allowance : success
        await grantSupplierRole(
            proxyAddress,
            cashInLimit,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await increaseSupplierAllowance(
            proxyAddress,
            amount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        let result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        let expectedAmount = cashInLimit.add(amount)
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin decreases supplier allowance : success
        await decreaseSupplierAllowance(
            proxyAddress,
            amount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expectedAmount = cashInLimit
        expect(result.toString()).to.eq(expectedAmount.toString())

        // Admin resets supplier allowance : success
        await resetSupplierAllowance(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result.toString()).to.eq('0')

        // Remove the supplier role for further testing.....
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('Non Admin account can not grant nor revoke supplier(s) role to an account', async function() {
        const cashInLimit = BigNumber.from(1)

        // Non admin grants limited supplier role : fail
        await expect(
            grantSupplierRole(
                proxyAddress,
                cashInLimit,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Non admin grants unlimited supplier role : fail
        await expect(
            grantUnlimitedSupplierRole(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Non admin revokes limited supplier role : fail
        await grantSupplierRole(
            proxyAddress,
            cashInLimit,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeSupplierRole(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Non admin revokes unlimited supplier role : fail
        await grantUnlimitedSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            revokeSupplierRole(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('Non Admin account can not increase, decrease and reset supplier(s) amount', async function() {
        const cashInLimit = BigNumber.from(10)
        const amount = BigNumber.from(1)

        // Non Admin increases supplier allowance : fail
        await grantSupplierRole(
            proxyAddress,
            cashInLimit,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await expect(
            increaseSupplierAllowance(
                proxyAddress,
                amount,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // non Admin decreases supplier allowance : fail
        await expect(
            decreaseSupplierAllowance(
                proxyAddress,
                amount,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Non Admin resets supplier allowance : fail
        await expect(
            resetSupplierAllowance(
                proxyAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        // Remove the supplier role for further testing.....
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })
})

describe('Grant unlimited supplier role and test its cashin right, maxsupply limit and role immutability', function() {
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
                BigNumber.from('1500').mul(TokenFactor)
            ).toString(),
        })

        proxyAddress = result[0]

        // Grant unlimited supplier role
        await grantUnlimitedSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Associate account to token
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with unlimited supplier role can cash in 100 tokens', async function() {
        const AmountToMint = BigNumber.from(100).mul(TokenFactor)

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const initialBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin tokens to previously associated account
        await Mint(
            proxyAddress,
            AmountToMint,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check balance of account and total supply : success
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const finalBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
        expect(finalBalanceOf.toString()).to.equals(
            expectedBalanceOf.toString()
        )
    })

    it('An account with unlimited supplier role can not cash in more than maxSupply tokens', async function() {
        // Retrieve current total supply
        const TotalSupply = await getTotalSupply(proxyAddress, operatorClient)

        // Cashin more tokens than max supply : fail
        await expect(
            Mint(
                proxyAddress,
                MAX_SUPPLY.sub(TotalSupply).add(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role can not be granted limited supplier role', async function() {
        // Grant limited supplier role to account with unlimited supplier role : fail
        await expect(
            grantSupplierRole(
                proxyAddress,
                BigNumber.from(1),
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with unlimited supplier role, but revoked, can not cash in anything at all', async function() {
        // Revoke unlimited supplier role
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin 1 token : fail
        await expect(
            Mint(
                proxyAddress,
                BigNumber.from(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})

describe('Grant limited supplier role and test its cashin right and cashin/maxsupply limits', function() {
    const cashInLimit = BigNumber.from(100).mul(TokenFactor)

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
                BigNumber.from('250').mul(TokenFactor)
            ).toString(),
        })

        proxyAddress = result[0]

        // Associate account to token
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    beforeEach(async function() {
        // Reset cash in limit for account with limited supplier role
        await grantSupplierRole(
            proxyAddress,
            cashInLimit,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with supplier role and an allowance of 100 tokens can cash in 100 tokens', async function() {
        const AmountToMint = cashInLimit

        // Get the initial total supply and account's balanceOf
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const initialBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin tokens to previously associated account
        await Mint(
            proxyAddress,
            AmountToMint,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check balance of account and total supply : success
        const finalTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )
        const finalBalanceOf = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        const expectedTotalSupply = initialTotalSupply.add(AmountToMint)
        const expectedBalanceOf = initialBalanceOf.add(AmountToMint)

        expect(finalTotalSupply.toString()).to.equals(
            expectedTotalSupply.toString()
        )
        expect(finalBalanceOf.toString()).to.equals(
            expectedBalanceOf.toString()
        )
    })

    it('An account with supplier role and an allowance of 90 tokens can not cash in 91 tokens', async function() {
        const cashInDecreaseAmount = BigNumber.from(10).mul(TokenFactor)

        // decrease allowance
        await decreaseSupplierAllowance(
            proxyAddress,
            cashInDecreaseAmount,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin more token than allowed : fail
        await expect(
            Mint(
                proxyAddress,
                cashInLimit.sub(cashInDecreaseAmount).add(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with supplier role and an allowance of (100 + maxsupply) tokens can not cash more than maxSupply tokens', async function() {
        // Increase total allowance by maxsupply
        await increaseSupplierAllowance(
            proxyAddress,
            MAX_SUPPLY,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin maxsupply + 1 token : fail
        await expect(
            Mint(
                proxyAddress,
                MAX_SUPPLY.add(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with supplier role and an allowance of 100 tokens, can mint 90 tokens but, later on, cannot mint 11 tokens', async function() {
        const amountToMintlater = BigNumber.from(10).mul(TokenFactor)

        // Cashin all allowed token minus "amountToMintLater"
        await Mint(
            proxyAddress,
            cashInLimit.sub(amountToMintlater),
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin the remaining allowed tokens (amountToMintLater) + 1 token :fail
        await expect(
            Mint(
                proxyAddress,
                amountToMintlater.add(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('An account with supplier role will reset allowance when unlimited supplier role is granted', async function() {
        // Grant unlimited supplier role
        await grantUnlimitedSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check that supplier Allowance was not set
        const result = await supplierAllowance(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(result.toString()).to.eq('0')

        // Reset status for further testing...
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
    })

    it('An account with supplier role, but revoked, can not cash in anything at all', async function() {
        // Revoke supplier role
        await revokeSupplierRole(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Cashin 1 token : fail
        await expect(
            Mint(
                proxyAddress,
                BigNumber.from(1),
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })
})
