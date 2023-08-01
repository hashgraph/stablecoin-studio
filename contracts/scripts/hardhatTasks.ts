/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractId } from '@hashgraph/sdk'
import { task } from 'hardhat/config'
import {
    deployFactory,
    deployHederaTokenManager,
    toHashgraphKey,
    updateProxy,
    getProxyImpl,
} from './deploy'
import { evmToHederaFormat, getClient, toEvmAddress } from './utils'
import {
    addHederaTokenManagerVersion,
    editHederaTokenManagerVersion,
    getAdminStableCoinFactory,
    getHederaTokenManagerAddresses,
    getProxyImplementation_SCF,
    owner_SCF,
    pendingOwner_SCF,
    removeHederaTokenManagerVersion,
} from './contractsMethods'

interface AccountHedera {
    account: string
    publicKey: string
    privateKey: string
    isED25519Type: string
}

task('addNewVersionTokenManager', 'Add a new version TokenManager in factory')
    .addParam('tokenmanager', 'The token manager address')
    .addParam('proxyfactory', 'The proxy factory address')
    .setAction(
        async (
            {
                tokenmanager,
                proxyfactory,
            }: { tokenmanager: string; proxyfactory: string },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)

            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )

            await addHederaTokenManagerVersion(
                ContractId.fromString(proxyfactory),
                client,
                ContractId.fromString(tokenmanager).toSolidityAddress()
            )

            console.log('TokenManager successfully added to proxy.')
        }
    )

task('getTokenManager', 'Get TokenManager list in factory')
    .addParam('proxyfactory', 'The proxy factory address')
    .setAction(async ({ proxyfactory }: { proxyfactory: string }, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519: boolean = accounts[0].isED25519Type === 'true'

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )

        const tokenManagerAddress: string[] =
            await getHederaTokenManagerAddresses(
                ContractId.fromString(proxyfactory),
                client
            )
        console.log(
            await Promise.all(
                tokenManagerAddress.map(async (item) => {
                    return await evmToHederaFormat(item)
                })
            )
        )
    })

task('getProxyAdminconfig', 'Get Proxy Admin owner and implementation')
    .addParam('proxyadmin', 'The proxy admin address')
    .addParam('proxy', 'The proxy address')
    .setAction(
        async (
            {
                proxyadmin,
                proxy,
            }: {
                proxyadmin: string
                proxy: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)
            const owner = await evmToHederaFormat(
                await owner_SCF(ContractId.fromString(proxyadmin), client)
            )

            const pendingQwner = await evmToHederaFormat(
                await pendingOwner_SCF(
                    ContractId.fromString(proxyadmin),
                    client
                )
            )

            const implementation = await evmToHederaFormat(
                await getProxyImplementation_SCF(
                    ContractId.fromString(proxyadmin),
                    client,
                    ContractId.fromString(proxy).toSolidityAddress()
                )
            )

            console.log(
                'Owner : ' +
                    owner +
                    '. Pending owner : ' +
                    pendingQwner +
                    '. Implementation : ' +
                    implementation
            )
        }
    )

task('updateTokenManager', 'Update TokenManager in factory')
    .addParam('tokenmanager', 'The token manager address')
    .addParam('proxyfactory', 'The proxy factory address')
    .addParam('index', 'Index you want to update')
    .setAction(
        async (
            {
                tokenmanager,
                proxyfactory,
                index,
            }: { tokenmanager: string; proxyfactory: string; index: number },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)

            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )

            await editHederaTokenManagerVersion(
                ContractId.fromString(proxyfactory),
                client,
                index,
                ContractId.fromString(tokenmanager).toSolidityAddress()
            )

            console.log('TokenManager selected updated successfully')
        }
    )

task('removeTokenManager', 'Remove TokenManager in factory')
    .addParam('proxyfactory', 'The proxy factory address')
    .addParam('index', 'Index you want to update')
    .setAction(
        async (
            { proxyfactory, index }: { proxyfactory: string; index: number },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)

            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )

            await removeHederaTokenManagerVersion(
                ContractId.fromString(proxyfactory),
                client,
                index
            )

            console.log('TokenManager selected removed successfully')
        }
    )

task('deployFactory', 'Deploy new factory').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519: boolean = accounts[0].isED25519Type === 'true'

        console.log(hre.network.name)

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )
        const tokenManager = await deployHederaTokenManager(
            client,
            client1privatekey
        )
        const initializeFactory = {
            admin: await toEvmAddress(client1account, client1isED25519),
            tokenManager: tokenManager.toSolidityAddress(),
        }
        const result = await deployFactory(
            initializeFactory,
            client,
            client1privatekey,
            client1isED25519
        )
        const proxyAddress = result[0]
        const proxyAdminAddress = result[1]
        const factoryAddress = result[2]
        console.log(
            '\nProxy Address: \t',
            proxyAddress.toString(),
            '\nProxy Admin Address: \t',
            proxyAdminAddress.toString(),
            '\nFactory Address: \t',
            factoryAddress.toString(),
            '\nHederaTokenManager Address: \t',
            tokenManager.toString()
        )
    }
)

task(
    'getFactoryAdmin',
    'Get the Factory admin account, the one with the right to add and remove tokenManagers'
)
    .addParam('proxyfactory', 'The proxy admin address')
    .setAction(
        async (
            {
                proxyfactory,
            }: {
                proxyfactory: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)
            const admin = await evmToHederaFormat(
                await getAdminStableCoinFactory(
                    ContractId.fromString(proxyfactory),
                    client
                )
            )

            console.log('Admin : ' + admin)
        }
    )

task('deployTokenManager', 'Deploy new TokenManager').setAction(
    async (arguements: any, hre) => {
        const accounts = hre.network.config
            .accounts as unknown as Array<AccountHedera>
        const client = getClient(hre.network.name)

        const client1account: string = accounts[0].account
        const client1privatekey: string = accounts[0].privateKey
        const client1isED25519: boolean = accounts[0].isED25519Type === 'true'

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )
        const tokenManager = await deployHederaTokenManager(
            client,
            client1privatekey
        )

        console.log('\nHederaTokenManager Address: \t', tokenManager.toString())
    }
)
task('updateFactoryVersion', 'Update factory version')
    .addParam('proxyadmin', 'The proxy admin address')
    .addParam('transparentproxy', 'The transparent proxy address')
    .addParam('implementation', 'The new implementation')
    .setAction(
        async (
            {
                proxyadmin,
                transparentproxy,
                implementation,
            }: {
                proxyadmin: string
                transparentproxy: string
                implementation: string
            },
            hre
        ) => {
            const accounts = hre.network.config
                .accounts as unknown as Array<AccountHedera>
            const client = getClient(hre.network.name)
            const client1account: string = accounts[0].account
            const client1privatekey: string = accounts[0].privateKey
            const client1isED25519: boolean =
                accounts[0].isED25519Type === 'true'

            client.setOperator(
                client1account,
                toHashgraphKey(client1privatekey, client1isED25519)
            )
            console.log(hre.network.name)

            await updateProxy(
                client,
                proxyadmin,
                transparentproxy,
                implementation
            )

            await getProxyImpl(client, proxyadmin, transparentproxy)
        }
    )

//deployFactoryProxy
//deployFactoryProxy
//upgradeFactoryVersion
