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
const abiERC20ProxyAdmin = HederaERC20ProxyAdmin__factory.abi

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
        })

        proxyAddress = result[0]
        reserveProxy = result[6]
    })

    it('input parmeters check', async function() {
        // We retreive the Token basic params
        const retrievedTokenName = await name(proxyAddress, operatorClient)
        const retrievedTokenSymbol = await symbol(proxyAddress, operatorClient)
        const retrievedTokenDecimals = await decimals(
            proxyAddress,
            operatorClient
        )
        const retrievedTokenTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        // We check their values : success
        expect(retrievedTokenName).to.equals(TokenName)
        expect(retrievedTokenSymbol).to.equals(TokenSymbol)
        expect(retrievedTokenDecimals).to.equals(TokenDecimals)
        expect(retrievedTokenTotalSupply.toString()).to.equals(
            INIT_SUPPLY.toString()
        )
    })

    it('Only Account can associate and dissociate itself when balance is 0', async function() {
        const amount = BigNumber.from(1).mul(TokenFactor)
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

    it('Associate and Dissociate Token', async function() {
        const amountToMint = BigNumber.from(1).mul(TokenFactor)

        // First we associate a token to an account
        const initialSupply = await getTotalSupply(proxyAddress, operatorClient)
        const initialBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // We mint tokens to that account and check supply and balance: success
        await Mint(
            proxyAddress,
            amountToMint,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        let newSupply = await getTotalSupply(proxyAddress, operatorClient)
        let newBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        const expectedNewSupply = initialSupply.add(amountToMint)
        const expectedNewBalance = initialBalance.add(amountToMint)

        expect(expectedNewSupply.toString()).to.equals(newSupply.toString())
        expect(expectedNewBalance.toString()).to.equals(newBalance.toString())

        // We wipe amount in account to be able to dissociate
        await Wipe(
            proxyAddress,
            newBalance,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // We dissociate the token from the account
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // We mint tokens to that account : fail
        await expect(
            Mint(
                proxyAddress,
                amountToMint,
                operatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        newSupply = await getTotalSupply(proxyAddress, operatorClient)
        newBalance = await getBalanceOf(
            proxyAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        expect(initialSupply.toString()).to.equals(newSupply.toString())
        expect('0').to.equals(newBalance.toString())
    })

    it('Check initialize can only be run once', async function() {
        // Retrieve current Token address
        const TokenAddress = await getTokenAddress(proxyAddress, operatorClient)

        // Initiliaze : fail
        await expect(
            initialize(proxyAddress, operatorClient, TokenAddress)
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Check transfer and transferFrom', async () => {
        const AMOUNT = BigNumber.from(10).mul(TokenFactor)
        await associateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        const approveRes = await approve(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            AMOUNT,
            operatorClient
        )
        await Mint(
            proxyAddress,
            AMOUNT,
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        const allowanceRes = await allowance(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )
        const transferFromRes = await transferFrom(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            nonOperatorAccount,
            nonOperatorIsE25519,
            BigNumber.from('3').mul(TokenFactor),
            nonOperatorClient
        )
        const balanceResp = await getBalanceOf(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        const allowancePost = await allowance(
            proxyAddress,
            operatorAccount,
            operatorIsE25519,
            nonOperatorAccount,
            nonOperatorIsE25519,
            operatorClient
        )

        const transferRes = await transfer(
            proxyAddress,
            nonOperatorAccount,
            nonOperatorIsE25519,
            BigNumber.from('3').mul(TokenFactor),
            operatorClient
        )
        const balanceResp2 = await getBalanceOf(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        // Reset accounts
        await Burn(
            proxyAddress,
            BigNumber.from(7).mul(TokenFactor),
            operatorClient
        )

        await Wipe(
            proxyAddress,
            BigNumber.from(6).mul(TokenFactor),
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )
        await dissociateToken(
            proxyAddress,
            nonOperatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        expect(transferRes).to.equals(true)
        expect(approveRes).to.equals(true)
        expect(allowanceRes).to.equals(AMOUNT)
        expect(transferFromRes).to.equals(true)
        expect(balanceResp).to.equals(BigNumber.from('3').mul(TokenFactor))
        expect(allowancePost).to.equals(BigNumber.from('7').mul(TokenFactor))
        expect(balanceResp2).to.equals(BigNumber.from('6').mul(TokenFactor))
    })

    it('Mint token throw error format number incorrrect', async () => {
        const initialTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        await expect(
            Mint(
                proxyAddress,
                BigNumber.from(1),
                operatorClient,
                operatorAccount,
                operatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)

        const afterErrorTotalSupply = await getTotalSupply(
            proxyAddress,
            operatorClient
        )

        expect(initialTotalSupply).to.equal(afterErrorTotalSupply)

        await Mint(
            proxyAddress,
            BigNumber.from(1).mul(TokenFactor),
            operatorClient,
            operatorAccount,
            operatorIsE25519
        )

        const totalSupply = await getTotalSupply(proxyAddress, operatorClient)

        expect(totalSupply).to.equal(
            initialTotalSupply.add(BigNumber.from(1).mul(TokenFactor))
        )
    })
})

describe('HederaERC20Proxy and HederaERC20ProxyAdmin Tests', function() {
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
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        stableCoinAddress = result[2]
    })

    it('Retrieve admin and implementation addresses for the Proxy', async function() {
        // We retreive the HederaERC20Proxy admin and implementation
        const implementation = await getProxyImplementation(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )
        const admin = await getProxyAdmin(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )

        // We check their values : success
        expect(implementation.toUpperCase()).to.equals(
            '0X' + stableCoinAddress.toSolidityAddress().toUpperCase()
        )
        expect(admin.toUpperCase()).to.equals(
            '0X' + proxyAdminAddress.toSolidityAddress().toUpperCase()
        )
    })

    it('Retrieve proxy admin owner', async function() {
        // We retreive the HederaERC20Proxy admin and implementation
        const ownerAccount = await owner(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient
        )

        // We check their values : success
        expect(ownerAccount.toUpperCase()).to.equals(
            (
                await toEvmAddress(operatorAccount, operatorIsE25519)
            ).toUpperCase()
        )
    })

    it('Upgrade Proxy implementation without the proxy admin', async function() {
        // Deploy a new contract
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
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        const newImplementationContract = result[2]

        // Non Admin upgrades implementation : fail
        await expect(
            upgradeTo(
                abiERC20ProxyAdmin,
                proxyAddress,
                operatorClient,
                newImplementationContract.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin without the proxy admin', async function() {
        // Non Admin changes admin : fail
        await expect(
            changeAdmin(
                abiERC20ProxyAdmin,
                proxyAddress,
                operatorClient,
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function() {
        // Deploy a new contract
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
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
        await expect(
            upgrade(
                abiERC20ProxyAdmin,
                proxyAdminAddress,
                nonOperatorClient,
                newImplementationContract.toSolidityAddress(),
                proxyAddress.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin with the proxy admin but without the owner account', async function() {
        // Non Owner changes admin : fail
        await expect(
            changeProxyAdmin(
                abiERC20ProxyAdmin,
                proxyAdminAddress,
                nonOperatorClient,
                nonOperatorAccount,
                proxyAddress,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Upgrade Proxy implementation with the proxy admin and the owner account', async function() {
        // Deploy a new contract
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
            initialAmountDataFeed: INIT_SUPPLY.toString(),
        })

        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
        await upgrade(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            newImplementationContract.toSolidityAddress(),
            proxyAddress.toSolidityAddress()
        )

        // Check new implementation address
        const implementation = await getProxyImplementation(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )
        expect(implementation.toUpperCase()).to.equals(
            '0X' + newImplementationContract.toSolidityAddress().toUpperCase()
        )

        // reset
        await upgrade(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            stableCoinAddress.toSolidityAddress(),
            proxyAddress.toSolidityAddress()
        )
    })

    it('Change Proxy admin with the proxy admin and the owner account', async function() {
        // Owner changes admin : success
        await changeProxyAdmin(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            operatorAccount,
            proxyAddress,
            operatorIsE25519
        )

        // Now we cannot get the admin using the Proxy admin contract.
        await expect(
            getProxyAdmin(
                abiERC20ProxyAdmin,
                proxyAdminAddress,
                operatorClient,
                proxyAddress.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)

        // Check that proxy admin has been changed
        const _admin = await admin(
            HederaERC20Proxy__factory.abi,
            proxyAddress,
            operatorClient
        )
        expect(_admin.toUpperCase()).to.equals(
            (
                await toEvmAddress(operatorAccount, operatorIsE25519)
            ).toUpperCase()
        )

        // reset
        await changeAdmin(
            HederaERC20Proxy__factory.abi,
            proxyAddress,
            operatorClient,
            await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
        )
        await changeAdmin(
            HederaERC20Proxy__factory.abi,
            proxyAddress,
            nonOperatorClient,
            proxyAdminAddress.toSolidityAddress()
        )
    })

    it('Transfers Proxy admin owner without the owner account', async function() {
        // Non Owner transfers owner : fail
        await expect(
            transferOwnership(
                abiERC20ProxyAdmin,
                proxyAdminAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Transfers Proxy admin owner with the owner account', async function() {
        // Owner transfers owner : success
        await transferOwnership(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check
        const ownerAccount = await owner(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            operatorClient
        )
        expect(ownerAccount.toUpperCase()).to.equals(
            (
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            ).toUpperCase()
        )

        // reset
        await transferOwnership(
            abiERC20ProxyAdmin,
            proxyAdminAddress,
            nonOperatorClient,
            operatorAccount,
            operatorIsE25519
        )
    })
})
