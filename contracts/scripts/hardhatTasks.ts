import { ContractId } from '@hashgraph/sdk'
import { task } from 'hardhat/config'
import { deployFactory, deployHederaERC20, toHashgraphKey } from './deploy'
import { evmToHederaFormat, getClient, toEvmAddress } from './utils'
import {
    addHederaERC20Version,
    editHederaERC20Version,
    getHederaERC20Addresses,
    removeHederaERC20Version,
} from './contractsMethods'

interface AccountHedera {
    account: string
    publicKey: string
    privateKey: string
    isED25519Type: string
}

task('addNewVersionERC20', 'Add a new version ERC20 in factory')
    .addParam('erc20', 'The erc20 address')
    .addParam('proxyfactory', 'The proxy factory address')
    .setAction(
        async (
            { erc20, proxyfactory }: { erc20: string; proxyfactory: string },
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

            await addHederaERC20Version(
                ContractId.fromString(proxyfactory),
                client,
                ContractId.fromString(erc20).toSolidityAddress()
            )

            console.log('ERC20 successfully added to proxy.')
        }
    )

task('getERC20', 'Get ERC20 list in factory')
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

        const erc20Address: string[] = await getHederaERC20Addresses(
            ContractId.fromString(proxyfactory),
            client
        )
        console.log(
            await Promise.all(
                erc20Address.map(async (item) => {
                    return await evmToHederaFormat(item)
                })
            )
        )
    })

task('updateERC20', 'Update ERC20 in factory')
    .addParam('erc20', 'The erc20 address')
    .addParam('proxyfactory', 'The proxy factory address')
    .addParam('index', 'Index you want to update')
    .setAction(
        async (
            {
                erc20,
                proxyfactory,
                index,
            }: { erc20: string; proxyfactory: string; index: number },
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

            await editHederaERC20Version(
                ContractId.fromString(proxyfactory),
                client,
                index,
                ContractId.fromString(erc20).toSolidityAddress()
            )

            console.log('ERC20 selected updated successfully')
        }
    )

task('removeERC20', 'Remove ERC20 in factory')
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

            await removeHederaERC20Version(
                ContractId.fromString(proxyfactory),
                client,
                index
            )

            console.log('ERC20 selected removed successfully')
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

        client.setOperator(
            client1account,
            toHashgraphKey(client1privatekey, client1isED25519)
        )
        const erc20 = await deployHederaERC20(client, client1privatekey)
        const initializeFactory = {
            admin: await toEvmAddress(client1account, client1isED25519),
            erc20: erc20.toSolidityAddress(),
        }
        const result = await deployFactory(
            initializeFactory,
            client,
            client1privatekey
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
            '\nHederaERC20 Address: \t',
            erc20.toString()
        )
    }
)

task('deployERC20', 'Deploy new ERC20').setAction(
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
        const erc20 = await deployHederaERC20(client, client1privatekey)

        console.log('\nHederaERC20 Address: \t', erc20.toString())
    }
)
