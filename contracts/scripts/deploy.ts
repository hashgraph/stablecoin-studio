import {
    ContractId,
    PublicKey,
    TokenSupplyType,
    PrivateKey,
    ContractFunctionParameters,
    Client,
} from '@hashgraph/sdk'
import { BigNumber } from 'ethers'

import {
    StableCoinFactory__factory,
    StableCoinFactoryProxyAdmin__factory,
    StableCoinFactoryProxy__factory,
    HederaERC20__factory,
} from '../typechain-types'

import {
    getClient,
    deployContractSDK,
    contractCall,
    toEvmAddress,
} from './utils'

const hre = require('hardhat')
const hederaERC20Address = '' //"0.0.49127272";

const factoryProxyAddress = '' //"0.0.49127286";
const factoryProxyAdminAddress = '' //"0.0.49127281";
const factoryAddress = '' //"0.0.49127276";

const ADDRESS_0 = '0x0000000000000000000000000000000000000000'
const hreConfig = hre.network.config

export function initializeClients(): [
    Client,
    string,
    string,
    string,
    boolean,
    Client,
    string,
    string,
    string,
    boolean
] {
    const client1 = getClient()
    const client1account: string = hreConfig.accounts[0].account
    const client1privatekey: string = hreConfig.accounts[0].privateKey
    const client1publickey: string = hreConfig.accounts[0].publicKey
    const client1isED25519: boolean = hreConfig.accounts[0].isED25519Type
    client1.setOperator(
        client1account,
        toHashgraphKey(client1privatekey, client1isED25519)
    )

    const client2 = getClient()
    const client2account: string = hreConfig.accounts[1].account
    const client2privatekey: string = hreConfig.accounts[1].privateKey
    const client2publickey: string = hreConfig.accounts[1].publicKey
    const client2isED25519: boolean = hreConfig.accounts[1].isED25519Type
    client2.setOperator(
        client2account,
        toHashgraphKey(client2privatekey, client2isED25519)
    )

    return [
        client1,
        client1account,
        client1privatekey,
        client1publickey,
        client1isED25519,
        client2,
        client2account,
        client2privatekey,
        client2publickey,
        client2isED25519,
    ]
}

export function toHashgraphKey(privateKey: string, isED25519: boolean) {
    return isED25519
        ? PrivateKey.fromStringED25519(privateKey)
        : PrivateKey.fromStringECDSA(privateKey)
}

export function getOperatorClient(
    client1: Client,
    client2: Client,
    clientId: number
) {
    return clientId == 1 ? client1 : client2
}

export function getOperatorAccount(
    client1account: string,
    client2account: string,
    clientId: number
) {
    return clientId == 1 ? client1account : client2account
}

export function getOperatorPrivateKey(
    client1privatekey: string,
    client2privatekey: string,
    clientId: number
) {
    return clientId == 1 ? client1privatekey : client2privatekey
}

export function getOperatorE25519(
    client1isED25519Type: boolean,
    client2isED25519Type: boolean,
    clientId: number
) {
    return clientId == 1 ? client1isED25519Type : client2isED25519Type
}

export function getOperatorPublicKey(
    client1publickey: string,
    client2publickey: string,
    clientId: number
) {
    return clientId == 1 ? client1publickey : client2publickey
}

export function getNonOperatorClient(
    client1: Client,
    client2: Client,
    clientId: number
) {
    return clientId == 2 ? client1 : client2
}

export function getNonOperatorAccount(
    client1account: string,
    client2account: string,
    clientId: number
) {
    return clientId == 2 ? client1account : client2account
}

export function getNonOperatorPrivateKey(
    client1privatekey: string,
    client2privatekey: string,
    clientId: number
) {
    return clientId == 2 ? client1privatekey : client2privatekey
}

export function getNonOperatorE25519(
    client1isED25519Type: boolean,
    client2isED25519Type: boolean,
    clientId: number
): boolean {
    return clientId == 2 ? client1isED25519Type : client2isED25519Type
}

export function getNonOperatorPublicKey(
    client1publickey: string,
    client2publickey: string,
    clientId: number
) {
    return clientId == 2 ? client1publickey : client2publickey
}

export async function deployHederaERC20(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Factory logic
    console.log(`Deploying HederaERC20 logic. please wait...`)

    const hederaERC20 = await deployContractSDK(
        HederaERC20__factory,
        privateKey,
        clientOperator
    )

    console.log(`HederaERC20 logic deployed ${hederaERC20.toSolidityAddress()}`)

    return hederaERC20
}

export async function deployFactory(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Factory logic
    console.log(`Deploying Contract Factory. please wait...`)

    const factory = await deployContractSDK(
        StableCoinFactory__factory,
        privateKey,
        clientOperator
    )

    console.log(`Contract Factory deployed ${factory.toSolidityAddress()}`)

    // Deploying Factory Proxy Admin
    console.log(`Deploying Contract Factory Proxy Admin. please wait...`)

    const factoryProxyAdmin = await deployContractSDK(
        StableCoinFactoryProxyAdmin__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Contract Factory Proxy Admin deployed ${factoryProxyAdmin.toSolidityAddress()}`
    )

    // Deploying Factory Proxy
    console.log(`Deploying Contract Factory Proxy. please wait...`)

    const params = new ContractFunctionParameters()
        .addAddress(factory.toSolidityAddress())
        .addAddress(factoryProxyAdmin.toSolidityAddress())
        .addBytes(new Uint8Array([]))

    const factoryProxy = await deployContractSDK(
        StableCoinFactoryProxy__factory,
        privateKey,
        clientOperator,
        params
    )

    console.log(
        `Contract Factory Proxy deployed ${factoryProxy.toSolidityAddress()}`
    )

    return [factoryProxy, factoryProxyAdmin, factory]
}
export type DeployParameters = {
    name: string
    symbol: string
    decimals: number
    initialSupply: string
    maxSupply: string | null
    memo: string
    account: string
    privateKey: string
    publicKey: string
    isED25519Type: boolean
    freeze?: boolean
    allToContract?: boolean
    reserveAddress?: string
    initialAmountDataFeed?: string
}
export async function deployContractsWithSDK({
    name,
    symbol,
    decimals = 6,
    initialSupply,
    maxSupply,
    memo,
    account,
    privateKey,
    publicKey,
    isED25519Type,
    freeze = false,
    allToContract = true,
    reserveAddress = ADDRESS_0,
    initialAmountDataFeed = initialSupply,
}: DeployParameters): Promise<ContractId[]> {
    const AccountEvmAddress = await toEvmAddress(account, isED25519Type)

    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

    console.log(`With user account  (${account}, ${AccountEvmAddress})`)

    const clientSdk = getClient()
    clientSdk.setOperator(account, toHashgraphKey(privateKey, isED25519Type))

    let hederaERC20: ContractId
    let f_address: ContractId
    let f_proxyAdminAddress: ContractId
    let f_proxyAddress: ContractId

    // Deploying HederaERC20 or using an already deployed one
    if (!hederaERC20Address) {
        hederaERC20 = await deployHederaERC20(clientSdk, privateKey)
    } else {
        hederaERC20 = ContractId.fromString(hederaERC20Address)
    }

    console.log(`Using the HederaERC20 logic contract at ${hederaERC20}.`)

    // Deploying a Factory or using an already deployed one
    if (!factoryAddress) {
        const result = await deployFactory(clientSdk, privateKey)
        f_proxyAddress = result[0]
        f_proxyAdminAddress = result[1]
        f_address = result[2]
    } else {
        f_address = ContractId.fromString(factoryAddress)
        f_proxyAdminAddress = ContractId.fromString(factoryProxyAdminAddress)
        f_proxyAddress = ContractId.fromString(factoryProxyAddress)
    }

    console.log(`Invoking Factory Proxy at ${f_proxyAddress}... please wait.`)

    const createDataFeed = reserveAddress === ADDRESS_0

    const tokenObject = {
        tokenName: name,
        tokenSymbol: symbol,
        freeze: freeze,
        supplyType:
            maxSupply !== null
                ? TokenSupplyType.Finite
                : TokenSupplyType.Infinite,
        tokenMaxSupply: maxSupply,
        tokenInitialSupply: initialSupply,
        tokenDecimals: decimals,
        autoRenewAccountAddress: AccountEvmAddress,
        treasuryAddress: ADDRESS_0,
        reserveAddress,
        reserveInitialAmount: initialAmountDataFeed,
        createReserve: createDataFeed,
        keys: allToContract
            ? tokenKeystoContract()
            : tokenKeystoKey(publicKey, isED25519Type),
    }

    console.log(`Token Object: ${JSON.stringify(tokenObject)}`)

    const parametersContractCall = [
        tokenObject,
        hederaERC20.toSolidityAddress(),
    ]

    console.log(`deploying stableCoin... please wait.`)

    const proxyContract = await contractCall(
        f_proxyAddress,
        'deployStableCoin',
        parametersContractCall,
        clientSdk,
        15000000,
        StableCoinFactory__factory.abi,
        35
    )

    console.log(
        `Proxy created: ${proxyContract[0]} , ${ContractId.fromSolidityAddress(
            proxyContract[0]
        ).toString()}`
    )
    console.log(
        `Proxy Admin created: ${
            proxyContract[1]
        } , ${ContractId.fromSolidityAddress(proxyContract[1]).toString()}`
    )
    console.log(
        `Implementation created: ${
            proxyContract[2]
        } , ${ContractId.fromSolidityAddress(proxyContract[2]).toString()}`
    )
    console.log(
        `Underlying token created: ${
            proxyContract[3]
        }, ${ContractId.fromSolidityAddress(proxyContract[3]).toString()}`
    )
    console.log(
        `Factory Proxy: ${f_proxyAddress.toSolidityAddress()}, ${f_proxyAddress}`
    )
    console.log(
        `Factory Proxy Admin: ${f_proxyAdminAddress.toSolidityAddress()}, ${f_proxyAdminAddress}`
    )
    console.log(
        `Factory Implementation: ${f_address.toSolidityAddress()}, ${f_address}`
    )

    return [
        ContractId.fromSolidityAddress(proxyContract[0]),
        ContractId.fromSolidityAddress(proxyContract[1]),
        ContractId.fromSolidityAddress(proxyContract[2]),
        f_proxyAddress,
        f_proxyAdminAddress,
        f_address,
    ]
}

function tokenKeystoContract() {
    const keys = [
        {
            keyType: 1, // admin
            PublicKey: '0x', // PublicKey.fromString(publicKey).toBytes(),
            isED25519: false,
        },
        {
            keyType: 4, // freeze
            PublicKey: '0x', // PublicKey.fromString(publicKey).toBytes(),
            isED25519: false,
        },
        {
            keyType: 8, // wipe
            PublicKey: '0x',
            isED25519: false,
        },
        {
            keyType: 16, // supply
            PublicKey: '0x',
            isED25519: false,
        },
        {
            keyType: 64, // pause
            PublicKey: '0x',
            isED25519: false,
        },
    ]

    return keys
}

function tokenKeystoKey(publicKey: string, isED25519: boolean) {
    const PK = PublicKey.fromString(publicKey).toBytesRaw()
    const keys = [
        {
            keyType: 1, // admin
            PublicKey: PK,
            isED25519: isED25519,
        },
        {
            keyType: 4, // freeze
            PublicKey: PK,
            isED25519: isED25519,
        },
        {
            keyType: 8, // wipe
            PublicKey: PK,
            isED25519: isED25519,
        },
        {
            keyType: 16, // supply
            PublicKey: PK,
            isED25519: isED25519,
        },
        {
            keyType: 64, // pause
            PublicKey: PK,
            isED25519: isED25519,
        },
    ]

    return keys
}
