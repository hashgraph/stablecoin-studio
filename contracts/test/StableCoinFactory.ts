import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
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
    deployFactory,
    toHashgraphKey,
    ADDRESS_0,
    deployHederaReserve,
} from '../scripts/deploy'
import {
    upgradeTo_SCF,
    admin_SCF,
    changeAdmin_SCF,
    owner_SCF,
    upgrade_SCF,
    changeProxyAdmin_SCF,
    transferOwnership_SCF,
    getProxyAdmin_SCF,
    getProxyImplementation_SCF,
    getReserveAddress,
    getReserveAmount,
} from '../scripts/contractsMethods'

import { clientId, toEvmAddress, getClient } from '../scripts/utils'
import { Client, ContractId } from '@hashgraph/sdk'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let clientSdk: Client

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let factoryAddress: ContractId

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
const toReserve = (amount: BigNumber) => {
    return amount.div(10)
}
const fromReserve = (amount: BigNumber) => {
    return amount.mul(10)
}
const TokenFactor = BigNumber.from(10).pow(TokenDecimals)
const INIT_SUPPLY = BigNumber.from(10).mul(TokenFactor)
const MAX_SUPPLY = BigNumber.from(1000).mul(TokenFactor)
const TokenMemo = 'Hedera Accelerator Stable Coin'

describe('StableCoinFactory Tests', function () {
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
    })

    it('Create StableCoin setting all token keys to the Proxy', async function () {
        // Deploy Token using Client
        await deployContractsWithSDK({
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
    })

    it('Create StableCoin setting all token keys to the Account', async function () {
        // Deploy Token using Client
        await deployContractsWithSDK({
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
            allToContract: false,
            initialAmountDataFeed: INIT_SUPPLY.add(
                BigNumber.from('150').mul(TokenFactor)
            ).toString(),
        })
    })

    it('Create StableCoin setting all token keys to the Account, with a very close reserve number', async function () {
        // Deploy Token using Client
        await deployContractsWithSDK({
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
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).add(1).toString(),
        })
    })

    it('Create StableCoin setting all token keys to the Account, with no reserve', async function () {
        // Deploy Token using Client
        const res = await deployContractsWithSDK({
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
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).add(1).toString(),
            createReserve: false,
        })
        const proxyAddress = res[0]

        const address = await getReserveAddress(proxyAddress, operatorClient)
        const amount = await getReserveAmount(proxyAddress, operatorClient)

        expect(address).to.equal(ADDRESS_0)
        expect(amount).to.equal(BigNumber.from(0))

        expect('0x' + res[7].toSolidityAddress()).to.equal(ADDRESS_0)
        expect('0x' + res[6].toSolidityAddress()).to.equal(ADDRESS_0)
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve', async function () {
        // Deploy Token using Client
        const res = await deployContractsWithSDK({
            name: TokenName,
            symbol: TokenSymbol,
            decimals: 0,
            initialSupply: BigNumber.from(10).toString(),
            maxSupply: MAX_SUPPLY.toString(),
            memo: TokenMemo,
            account: operatorAccount,
            privateKey: operatorPriKey,
            publicKey: operatorPubKey,
            isED25519Type: operatorIsE25519,
            allToContract: false,
            initialAmountDataFeed: toReserve(INIT_SUPPLY).toString(),
        })
        const proxyAddress = res[0]

        const address = await getReserveAddress(proxyAddress, operatorClient)
        const amount = await getReserveAmount(proxyAddress, operatorClient)

        expect(address).not.to.equal(ADDRESS_0)
        expect(amount.toString()).to.equal(toReserve(INIT_SUPPLY).toString())
    })

    it('Create StableCoin setting all token keys to the Account, with less decimals than reserve, expect it to fail', async function () {
        // Deploy Token using Client
        expect(
            deployContractsWithSDK({
                name: TokenName,
                symbol: TokenSymbol,
                decimals: 0,
                initialSupply: INIT_SUPPLY.toString(),
                maxSupply: MAX_SUPPLY.toString(),
                memo: TokenMemo,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                allToContract: false,
                initialAmountDataFeed: toReserve(INIT_SUPPLY).sub(1).toString(),
            })
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, expect it to fail', async function () {
        // Deploy Token using Client
        expect(
            deployContractsWithSDK({
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
                allToContract: false,
                initialAmountDataFeed: BigNumber.from(1).toString(),
            })
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, expect it to fail with a very close number', async function () {
        // Deploy Token using Client
        expect(
            deployContractsWithSDK({
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
                allToContract: false,
                initialAmountDataFeed: toReserve(INIT_SUPPLY).sub(1).toString(),
            })
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Create StableCoin setting an initial supply over the reserve, when the reserve is provided and not deployed, expect it to fail', async function () {
        // first deploy Hedera Reserve
        const reserveAmount = BigNumber.from(1)
        const result = await deployHederaReserve(
            reserveAmount,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        const DataFeedAddress = result[0]

        // Deploy Token using Client
        const initSupplyAmount = reserveAmount.add(1)
        const maxSupplyAmount = initSupplyAmount.add(1)
        expect(
            deployContractsWithSDK({
                name: TokenName,
                symbol: TokenSymbol,
                decimals: TokenDecimals,
                initialSupply: initSupplyAmount.toString(),
                maxSupply: maxSupplyAmount.toString(),
                memo: TokenMemo,
                account: operatorAccount,
                privateKey: operatorPriKey,
                publicKey: operatorPubKey,
                isED25519Type: operatorIsE25519,
                allToContract: false,
                reserveAddress: String(DataFeedAddress),
                createReserve: false,
            })
        ).to.eventually.be.rejectedWith(Error)
    })
})

describe.skip('StableCoinFactoryProxy and StableCoinFactoryProxyAdmin Tests', function () {
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
        clientSdk = getClient()
        clientSdk.setOperator(
            operatorAccount,
            toHashgraphKey(operatorPriKey, operatorIsE25519)
        )

        const result = await deployFactory(clientSdk, operatorPriKey)

        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        factoryAddress = result[2]
    })

    it('Retrieve admin and implementation addresses for the Proxy', async function () {
        // We retreive the HederaERC20Proxy admin and implementation
        const implementation = await getProxyImplementation_SCF(
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )
        const admin = await getProxyAdmin_SCF(
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )

        // We check their values : success
        expect(implementation.toUpperCase()).to.equals(
            '0X' + factoryAddress.toSolidityAddress().toUpperCase()
        )
        expect(admin.toUpperCase()).to.equals(
            '0X' + proxyAdminAddress.toSolidityAddress().toUpperCase()
        )
    })

    it('Retrieve proxy admin owner', async function () {
        // We retreive the HederaERC20Proxy admin and implementation
        const ownerAccount = await owner_SCF(proxyAdminAddress, operatorClient)

        // We check their values : success
        expect(ownerAccount.toUpperCase()).to.equals(
            (
                await toEvmAddress(operatorAccount, operatorIsE25519)
            ).toUpperCase()
        )
    })

    it('Upgrade Proxy implementation without the proxy admin', async function () {
        // Deploy a new contract
        const result = await deployFactory(clientSdk, operatorPriKey)

        const newImplementationContract = result[2]

        // Non Admin upgrades implementation : fail
        await expect(
            upgradeTo_SCF(
                proxyAddress,
                operatorClient,
                newImplementationContract.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin without the proxy admin', async function () {
        // Non Admin changes admin : fail
        await expect(
            changeAdmin_SCF(
                proxyAddress,
                operatorClient,
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
        // Deploy a new contract
        const result = await deployFactory(clientSdk, operatorPriKey)

        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
        await expect(
            upgrade_SCF(
                proxyAdminAddress,
                nonOperatorClient,
                newImplementationContract.toSolidityAddress(),
                proxyAddress.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin with the proxy admin but without the owner account', async function () {
        // Non Owner changes admin : fail
        await expect(
            changeProxyAdmin_SCF(
                proxyAdminAddress,
                nonOperatorClient,
                nonOperatorAccount,
                proxyAddress,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Upgrade Proxy implementation with the proxy admin and the owner account', async function () {
        // Deploy a new contract
        const result = await deployFactory(clientSdk, operatorPriKey)

        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
        await upgrade_SCF(
            proxyAdminAddress,
            operatorClient,
            newImplementationContract.toSolidityAddress(),
            proxyAddress.toSolidityAddress()
        )

        // Check new implementation address
        const implementation = await getProxyImplementation_SCF(
            proxyAdminAddress,
            operatorClient,
            proxyAddress.toSolidityAddress()
        )
        expect(implementation.toUpperCase()).to.equals(
            '0X' + newImplementationContract.toSolidityAddress().toUpperCase()
        )

        // reset
        await upgrade_SCF(
            proxyAdminAddress,
            operatorClient,
            factoryAddress.toSolidityAddress(),
            proxyAddress.toSolidityAddress()
        )
    })

    it('Change Proxy admin with the proxy admin and the owner account', async function () {
        // Owner changes admin : success
        await changeProxyAdmin_SCF(
            proxyAdminAddress,
            operatorClient,
            operatorAccount,
            proxyAddress,
            operatorIsE25519
        )

        // Now we cannot get the admin using the Proxy admin contract.
        await expect(
            getProxyAdmin_SCF(
                proxyAdminAddress,
                operatorClient,
                proxyAddress.toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)

        // Check that proxy admin has been changed
        const _admin = await admin_SCF(proxyAddress, operatorClient)
        expect(_admin.toUpperCase()).to.equals(
            (
                await toEvmAddress(operatorAccount, operatorIsE25519)
            ).toUpperCase()
        )

        // reset
        await changeAdmin_SCF(
            proxyAddress,
            operatorClient,
            await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
        )
        await changeAdmin_SCF(
            proxyAddress,
            nonOperatorClient,
            proxyAdminAddress.toSolidityAddress()
        )
    })

    it('Transfers Proxy admin owner without the owner account', async function () {
        // Non Owner transfers owner : fail
        await expect(
            transferOwnership_SCF(
                proxyAdminAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Transfers Proxy admin owner with the owner account', async function () {
        // Owner transfers owner : success
        await transferOwnership_SCF(
            proxyAdminAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check
        const ownerAccount = await owner_SCF(proxyAdminAddress, operatorClient)
        expect(ownerAccount.toUpperCase()).to.equals(
            (
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            ).toUpperCase()
        )

        // reset
        await transferOwnership_SCF(
            proxyAdminAddress,
            nonOperatorClient,
            operatorAccount,
            operatorIsE25519
        )
    })
})
