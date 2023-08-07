/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber } from 'ethers'
import {
    initializeClients,
    getOperatorClient,
    getOperatorAccount,
    getOperatorPrivateKey,
    getOperatorE25519,
    getOperatorPublicKey,
    getNonOperatorClient,
    getNonOperatorAccount,
    getNonOperatorE25519,
    deployHederaReserve,
} from '../scripts/deploy'
import {
    upgradeTo,
    admin,
    changeAdmin,
    owner,
    upgrade,
    changeProxyAdmin,
    transferOwnership,
    getProxyAdmin,
    getProxyImplementation,
    initializeHederaReserve,
    setAdminHederaReserve,
    setAmountHederaReserve,
    latestRoundDataDataHederaReserve,
    decimalsHederaReserve,
    descriptionHederaReserve,
    versionHederaReserve,
} from '../scripts/contractsMethods'
import { clientId, toEvmAddress, getContractInfo } from '../scripts/utils'
import { AccountId, Client, ContractId } from '@hashgraph/sdk'
import {
    ProxyAdmin__factory,
    ITransparentUpgradeableProxy__factory,
} from '../typechain-types'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

let proxyAddress: ContractId
let proxyAdminAddress: ContractId
let hederaReserveAddress: ContractId

let operatorClient: Client
let nonOperatorClient: Client
let operatorAccount: string
let nonOperatorAccount: string
let operatorPriKey: string
let operatorPubKey: string
let operatorIsE25519: boolean
let nonOperatorIsE25519: boolean

const TokenFactor = BigNumber.from(10).pow(3)
const reserve = BigNumber.from('100').mul(TokenFactor)

const proxyAdminAbi = ProxyAdmin__factory.abi

describe('HederaReserve Tests', function () {
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

        const result = await deployHederaReserve(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        hederaReserveAddress = result[2]
        
        await initializeHederaReserve(
            BigNumber.from(1000),
            proxyAddress,
            operatorClient,
            AccountId.fromString(operatorAccount).toSolidityAddress()
        )
        
    })

    it('Check initialize can only be run once', async function () {
        expect(
             initializeHederaReserve(
                BigNumber.from(1000),
                proxyAddress,
                operatorClient,
                AccountId.fromString(operatorAccount).toSolidityAddress()
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Update admin address', async function () {
        const ONE = BigNumber.from(1)

        await setAdminHederaReserve(
            await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519),
            proxyAddress,
            operatorClient
        )
        await setAmountHederaReserve(ONE, proxyAddress, nonOperatorClient)

        const amount = await latestRoundDataDataHederaReserve(
            proxyAddress,
            nonOperatorClient
        )
        expect(amount).to.equals(ONE.toString())

        //RESET
        await setAdminHederaReserve(
            await toEvmAddress(operatorAccount, operatorIsE25519),
            proxyAddress,
            nonOperatorClient
        )
        await setAmountHederaReserve(reserve, proxyAddress, operatorClient)
        const amountReset = await latestRoundDataDataHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(amountReset).to.equals(reserve.toString())
    })

    it('Update admin address throw error client no isAdmin', async function () {
        expect(
            setAdminHederaReserve(
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519),
                proxyAddress,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Update reserve throw error client no isAdmin', async function () {
        expect(
            setAmountHederaReserve(
                BigNumber.from(1),
                proxyAddress,
                nonOperatorClient
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Update reserve', async function () {
        const beforeUpdateAmount = await latestRoundDataDataHederaReserve(
            proxyAddress,
            operatorClient
        )
        await setAmountHederaReserve(
            BigNumber.from(1),
            proxyAddress,
            operatorClient
        )
        const afterUpdateAmount = await latestRoundDataDataHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(beforeUpdateAmount).not.to.equals(afterUpdateAmount)
        expect(afterUpdateAmount).to.equals(BigNumber.from(1).toString())

        //RESET
        await setAmountHederaReserve(reserve, proxyAddress, operatorClient)
        const amountReset = await latestRoundDataDataHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(amountReset).to.equals(reserve.toString())
    })

    it('Get decimals', async function () {
        const decimals = await decimalsHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(decimals).to.equals('2')
    })

    it('Get description', async function () {
        const decimals = await descriptionHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(decimals).to.equals('Example Hedera Reserve for ChainLink')
    })

    it('Get version', async function () {
        const decimals = await versionHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(decimals).to.equals('1')
    })

    it('Get latestRoundData', async function () {
        const amountReset = await latestRoundDataDataHederaReserve(
            proxyAddress,
            operatorClient
        )
        expect(amountReset).to.equals(reserve.toString())
    })
})

describe('HederaReserveProxy and HederaReserveProxyAdmin Tests', function () {
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

        const result = await deployHederaReserve(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        proxyAddress = result[0]
        proxyAdminAddress = result[1]
        hederaReserveAddress = result[2]
    })

    it('Retrieve admin and implementation addresses for the Proxy', async function () {
        // We retreive the HederaReserveProxy admin and implementation
        const implementation = await getProxyImplementation(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address
        )
        const admin = await getProxyAdmin(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address
        )

        // We check their values : success
        expect(implementation.toUpperCase()).to.equals(
            (
                await getContractInfo(hederaReserveAddress.toString())
            ).evm_address.toUpperCase()
        )
        expect(admin.toUpperCase()).to.equals(
            (
                await getContractInfo(proxyAdminAddress.toString())
            ).evm_address.toUpperCase()
        )
    })

    it('Retrieve proxy admin owner', async function () {
        // We retreive the HederaReserveProxy admin and implementation
        const ownerAccount = await owner(
            proxyAdminAbi,
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

    it('Upgrade Proxy implementation without the proxy admin', async function () {
        // Deploy a new contract
        const result = await deployHederaReserve(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )

        const newImplementationContract = result[2]

        // Non Admin upgrades implementation : fail
        await expect(
            upgradeTo(
                proxyAdminAbi,
                proxyAddress,
                operatorClient,
                (
                    await getContractInfo(newImplementationContract.toString())
                ).evm_address
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin without the proxy admin', async function () {
        // Non Admin changes admin : fail
        await expect(
            changeAdmin(
                proxyAdminAbi,
                proxyAddress,
                operatorClient,
                await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Upgrade Proxy implementation with the proxy admin but without the owner account', async function () {
        // Deploy a new contract
        const result = await deployHederaReserve(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )
        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is not the owner : fails
        await expect(
            upgrade(
                proxyAdminAbi,
                proxyAdminAddress,
                nonOperatorClient,
                (
                    await getContractInfo(newImplementationContract.toString())
                ).evm_address,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Change Proxy admin with the proxy admin but without the owner account', async function () {
        // Non Owner changes admin : fail
        await expect(
            changeProxyAdmin(
                proxyAdminAbi,
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
        const result = await deployHederaReserve(
            reserve,
            operatorAccount,
            operatorIsE25519,
            operatorClient,
            operatorPriKey
        )

        const newImplementationContract = result[2]

        // Upgrading the proxy implementation using the Proxy Admin with an account that is the owner : success
        await upgrade(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            (
                await getContractInfo(newImplementationContract.toString())
            ).evm_address,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address
        )

        // Check new implementation address
        const implementation = await getProxyImplementation(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address
        )
        expect(implementation.toUpperCase()).to.equals(
            (
                await getContractInfo(newImplementationContract.toString())
            ).evm_address.toUpperCase()
        )

        // reset
        await upgrade(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            (
                await getContractInfo(hederaReserveAddress.toString())
            ).evm_address,
            (
                await getContractInfo(proxyAddress.toString())
            ).evm_address
        )
    })

    it('Change Proxy admin with the proxy admin and the owner account', async function () {
        // Owner changes admin : success
        await changeProxyAdmin(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            operatorAccount,
            proxyAddress,
            operatorIsE25519
        )

        // Now we cannot get the admin using the Proxy admin contract.
        await expect(
            getProxyAdmin(
                proxyAdminAbi,
                proxyAdminAddress,
                operatorClient,
                (
                    await getContractInfo(proxyAddress.toString())
                ).evm_address
            )
        ).to.eventually.be.rejectedWith(Error)

        // Check that proxy admin has been changed
        const _admin = await admin(
            ITransparentUpgradeableProxy__factory.abi,
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
            ITransparentUpgradeableProxy__factory.abi,
            proxyAddress,
            operatorClient,
            await toEvmAddress(nonOperatorAccount, nonOperatorIsE25519)
        )
        await changeAdmin(
            ITransparentUpgradeableProxy__factory.abi,
            proxyAddress,
            nonOperatorClient,
            (
                await getContractInfo(proxyAdminAddress.toString())
            ).evm_address
        )
    })

    it('Transfers Proxy admin owner without the owner account', async function () {
        // Non Owner transfers owner : fail
        await expect(
            transferOwnership(
                proxyAdminAbi,
                proxyAdminAddress,
                nonOperatorClient,
                nonOperatorAccount,
                nonOperatorIsE25519
            )
        ).to.eventually.be.rejectedWith(Error)
    })

    it('Transfers Proxy admin owner with the owner account', async function () {
        // Owner transfers owner : success
        await transferOwnership(
            proxyAdminAbi,
            proxyAdminAddress,
            operatorClient,
            nonOperatorAccount,
            nonOperatorIsE25519
        )

        // Check
        const ownerAccount = await owner(
            proxyAdminAbi,
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
            proxyAdminAbi,
            proxyAdminAddress,
            nonOperatorClient,
            operatorAccount,
            operatorIsE25519
        )
    })
})
