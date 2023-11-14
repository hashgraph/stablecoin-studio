/* eslint-disable @typescript-eslint/no-explicit-any */
import {Client, ContractFunctionParameters, ContractId, PrivateKey, PublicKey, TokenSupplyType,} from '@hashgraph/sdk'
import {BigNumber} from 'ethers'
import {
    HederaReserve__factory,
    HederaTokenManager__factory,
    ProxyAdmin__factory,
    StableCoinFactory__factory,
    StableCoinProxyAdmin__factory,
    TransparentUpgradeableProxy__factory,
} from '../typechain-types'
import {associateToken, deployContractSDK, getClient, getContractInfo, sleep, toEvmAddress,} from './utils'
import {
    ADDRESS_ZERO,
    BURN_ROLE,
    DELETE_ROLE,
    FREEZE_ROLE,
    KYC_ROLE,
    PAUSE_ROLE,
    RESCUE_ROLE,
    WIPE_ROLE,
} from './constants'
import {grantKyc} from './contractsMethods'
import {deployContract} from './contractsLifeCycle/deploy'
import {contractCall} from './contractsLifeCycle/utils'

const HEDERA_TOKEN_MANAGER_ADDRESS = '0.0.1137621'
export const FACTORY_PROXY_ADDRESS = '0.0.1137631'
const FACTORY_PROXY_ADMIN_ADDRESS = '0.0.1137629'
const FACTORY_ADDRESS = '0.0.1137625'

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
    const hre = require('hardhat')
    const hreConfig = hre.network.config
    const clientOne = getClient()
    const clientOneAccount: string = hreConfig.accounts[0].account
    const clientOnePrivateKey: string = hreConfig.accounts[0].privateKey
    const clientOnePublicKey: string = hreConfig.accounts[0].publicKey
    const clientOneIsED25519: boolean =
        hreConfig.accounts[0].isED25519Type === 'true'
    clientOne.setOperator(
        clientOneAccount,
        toHashgraphKey(clientOnePrivateKey, clientOneIsED25519)
    )

    const clientTwo = getClient()
    const clientTwoAccount: string = hreConfig.accounts[1].account
    const clientTwoPrivateKey: string = hreConfig.accounts[1].privateKey
    const clientTwoPublicKey: string = hreConfig.accounts[1].publicKey
    const clientTwoIsED25519 = hreConfig.accounts[1].isED25519Type === 'true'
    clientTwo.setOperator(
        clientTwoAccount,
        toHashgraphKey(clientTwoPrivateKey, clientTwoIsED25519)
    )

    return [
        clientOne,
        clientOneAccount,
        clientOnePrivateKey,
        clientOnePublicKey,
        clientOneIsED25519,
        clientTwo,
        clientTwoAccount,
        clientTwoPrivateKey,
        clientTwoPublicKey,
        clientTwoIsED25519,
    ]
}

export function toHashgraphKey(privateKey: string, isED25519: boolean) {
    return isED25519
        ? PrivateKey.fromStringED25519(privateKey)
        : PrivateKey.fromStringECDSA(privateKey)
}

export function getOperatorClient(
    clientOne: Client,
    clientTwo: Client,
    clientId: number
) {
    return clientId == 1 ? clientOne : clientTwo
}

export function getOperatorAccount(
    clientOneAccount: string,
    clientTwoAccount: string,
    clientId: number
) {
    return clientId == 1 ? clientOneAccount : clientTwoAccount
}

export function getOperatorPrivateKey(
    clientOnePrivateKey: string,
    clientTwoPrivateKey: string,
    clientId: number
) {
    return clientId == 1 ? clientOnePrivateKey : clientTwoPrivateKey
}

export function getOperatorE25519(
    clientOneIsED25519Type: boolean,
    clientTwoIsED25519Type: boolean,
    clientId: number
) {
    return clientId == 1 ? clientOneIsED25519Type : clientTwoIsED25519Type
}

export function getOperatorPublicKey(
    clientOnePublicKey: string,
    clientTwoPublicKey: string,
    clientId: number
) {
    return clientId == 1 ? clientOnePublicKey : clientTwoPublicKey
}

export function getNonOperatorClient(
    clientOne: Client,
    clientTwo: Client,
    clientId: number
) {
    return clientId == 2 ? clientOne : clientTwo
}

export function getNonOperatorAccount(
    clientOneAccount: string,
    clientTwoAccount: string,
    clientId: number
) {
    return clientId == 2 ? clientOneAccount : clientTwoAccount
}

export function getNonOperatorPrivateKey(
    clientOnePrivateKey: string,
    clientTwoPrivateKey: string,
    clientId: number
) {
    return clientId == 2 ? clientOnePrivateKey : clientTwoPrivateKey
}

export function getNonOperatorE25519(
    clientOneIsED25519Type: boolean,
    clientTwoIsED25519Type: boolean,
    clientId: number
): boolean {
    return clientId == 2 ? clientOneIsED25519Type : clientTwoIsED25519Type
}

export function getNonOperatorPublicKey(
    clientOnePublicKey: string,
    clientTwoPublicKey: string,
    clientId: number
) {
    return clientId == 2 ? clientOnePublicKey : clientTwoPublicKey
}

export async function deployHederaTokenManager(
    clientOperator: Client,
    privateKey: string
) {
    // Deploying Factory logic
    console.log(`Deploying HederaTokenManager. please wait...`)

    const hederaTokenManager = await deployContract(
        HederaTokenManager__factory,
        privateKey,
        clientOperator
    )

    await sleep(5000)

    console.log(
        `HederaTokenManager logic deployed ${
            (await getContractInfo(hederaTokenManager.toString())).evm_address
        }`
    )

    return hederaTokenManager
}

export async function updateProxy(
    clientOperator: Client,
    proxy: string,
    transparentproxy: string,
    newImplementation: string
) {
    // Deploying Factory logic
    console.log(`Upgrading proxy logic. please wait...`)
    console.log('Admin proxy :' + proxy)
    console.log('Transparent proxy :' + transparentproxy)
    console.log('New Implementation :' + newImplementation)
    console.log(ContractId.fromString(newImplementation).toSolidityAddress())
    await contractCall(
        ContractId.fromString(proxy),
        'upgrade',
        [
            ContractId.fromString(transparentproxy).toSolidityAddress(),
            ContractId.fromString(newImplementation).toSolidityAddress(),
        ],
        clientOperator,
        150000,
        ProxyAdmin__factory.abi
    )
}
export async function getProxyImpl(
    clientOperator: Client,
    proxyadmin: string,
    transparent: string
) {
    // Deploying Factory logic
    console.log(`Getting implementation from proxy please wait...`)
    console.log('ProxyAdmin :' + proxyadmin)
    const address = await contractCall(
        ContractId.fromString(proxyadmin),
        'getProxyImplementation',
        [ContractId.fromString(transparent).toSolidityAddress()],
        clientOperator,
        150000,
        ProxyAdmin__factory.abi
    )
    console.log('New Implementation' + address[0])
}

export async function deployFactory(
    initializeParams: { admin: string; tokenManager: string },
    clientOperator: Client,
    privateKey: string,
    isED25519Type: boolean
) {
    // Deploying Factory logic
    console.log(`Deploying Contract Factory. please wait...`)

    const factory = await deployContractSDK(
        StableCoinFactory__factory,
        privateKey,
        clientOperator
    )

    console.log(
        `Contract Factory deployed ${
            (await getContractInfo(factory.toString())).evm_address
        }`
    )

    // Deploying Factory Proxy Admin
    console.log(`Deploying Contract Factory Proxy Admin. please wait...`)

    const AccountEvmAddress = await toEvmAddress(
        clientOperator.operatorAccountId!.toString(),
        isED25519Type
    )

    const paramsProxyAdmin = new ContractFunctionParameters().addAddress(
        AccountEvmAddress
    )

    const factoryProxyAdmin = await deployContractSDK(
        StableCoinProxyAdmin__factory,
        privateKey,
        clientOperator,
        paramsProxyAdmin
    )

    console.log(
        `Contract Factory Proxy Admin deployed ${
            (await getContractInfo(factoryProxyAdmin.toString())).evm_address
        }`
    )

    // Deploying Factory Proxy
    console.log(`Deploying Contract Factory Proxy. please wait...`)

    const params = new ContractFunctionParameters()
        .addAddress((await getContractInfo(factory.toString())).evm_address)
        .addAddress(
            (await getContractInfo(factoryProxyAdmin.toString())).evm_address
        )
        .addBytes(new Uint8Array([]))

    const factoryProxy = await deployContractSDK(
        TransparentUpgradeableProxy__factory,
        privateKey,
        clientOperator,
        params,
        undefined,
        '0x' + factoryProxyAdmin.toSolidityAddress()
    )

    await contractCall(
        factoryProxy,
        'initialize',
        [initializeParams.admin, initializeParams.tokenManager],
        clientOperator,
        130000,
        StableCoinFactory__factory.abi
    )

    console.log(
        `Contract Factory Proxy deployed ${
            (await getContractInfo(factoryProxyAdmin.toString())).evm_address
        }`
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
    createReserve?: boolean
    grantKYCToOriginalSender?: boolean
    addKyc?: boolean
    allRolesToCreator?: boolean
    RolesToAccount?: string
    isRolesToAccountE25519?: boolean
    initialMetadata?: string
    proxyAdminOwnerAccount?: string
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
    reserveAddress = ADDRESS_ZERO,
    initialAmountDataFeed = initialSupply,
    createReserve = true,
    grantKYCToOriginalSender = false,
    addKyc = false,
    allRolesToCreator = true,
    RolesToAccount = '',
    isRolesToAccountE25519 = false,
    initialMetadata = 'test',
    proxyAdminOwnerAccount = ADDRESS_ZERO,
}: DeployParameters): Promise<ContractId[]> {
    const AccountEvmAddress = await toEvmAddress(account, isED25519Type)

    console.log(
        `Creating token  (${name},${symbol},${decimals},${initialSupply},${maxSupply},${memo},${freeze})`
    )

    console.log(`With user account  (${account}, ${AccountEvmAddress})`)

    const clientSdk = getClient()
    clientSdk.setOperator(account, toHashgraphKey(privateKey, isED25519Type))

    let hederaTokenManager: ContractId
    let f_address: ContractId
    let f_proxyAdminAddress: ContractId
    let f_proxyAddress: ContractId

    // Deploying HederaTokenManager or using an already deployed one
    if (!HEDERA_TOKEN_MANAGER_ADDRESS) {
        //TODO: MARIO ensure if the tests are calling this more than once
        console.log(
            '!!!!!!!!!!!!!!UPLOADED FILE!!!!!!!!!!!!!!!!!: deployHederaTokenManager'
        )
        hederaTokenManager = await deployHederaTokenManager(
            clientSdk,
            privateKey
        )
    } else {
        hederaTokenManager = ContractId.fromString(HEDERA_TOKEN_MANAGER_ADDRESS)
    }

    console.log(
        `Using the HederaTokenManager logic contract at ${hederaTokenManager}.`
    )

    // Deploying a Factory or using an already deployed one
    if (!FACTORY_ADDRESS) {
        const initializeFactory = {
            admin: AccountEvmAddress,
            tokenManager: (await getContractInfo(hederaTokenManager.toString()))
                .evm_address,
        }
        const result = await deployFactory(
            initializeFactory,
            clientSdk,
            privateKey,
            isED25519Type
        )
        f_proxyAddress = result[0]
        f_proxyAdminAddress = result[1]
        f_address = result[2]
    } else {
        f_address = ContractId.fromString(FACTORY_ADDRESS)
        f_proxyAdminAddress = ContractId.fromString(FACTORY_PROXY_ADMIN_ADDRESS)
        f_proxyAddress = ContractId.fromString(FACTORY_PROXY_ADDRESS)
    }

    console.log(`Invoking Factory Proxy at ${f_proxyAddress}... please wait.`)

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
        reserveAddress,
        reserveInitialAmount: initialAmountDataFeed,
        createReserve,
        keys: allToContract
            ? tokenKeystoContract(addKyc)
            : tokenKeystoKey(publicKey, isED25519Type),
        roles: await rolestoAccountsByKeys(
            allToContract,
            allRolesToCreator,
            account,
            isED25519Type,
            RolesToAccount,
            isRolesToAccountE25519
        ),
        cashinRole: await cashInRoleAssignment(
            allToContract,
            allRolesToCreator,
            account,
            isED25519Type,
            RolesToAccount,
            isRolesToAccountE25519
        ),
        metadata: initialMetadata,
        proxyAdminOwnerAccount: proxyAdminOwnerAccount,
    }

    const parametersContractCall = [
        tokenObject,
        (await getContractInfo(hederaTokenManager.toString())).evm_address,
    ]

    console.log(`Deploying stableCoin... please wait.`)

    const proxyContract: string[] = (
        await contractCall(
            f_proxyAddress,
            'deployStableCoin',
            parametersContractCall,
            clientSdk,
            15000000,
            StableCoinFactory__factory.abi,
            35
        )
    )[0]

    console.log(`Associating token... please wait.`)

    await associateToken(
        ContractId.fromSolidityAddress(proxyContract[3]).toString(),
        account,
        clientSdk
    )

    if (grantKYCToOriginalSender) {
        console.log(`Granting KYC to Original Sender... please wait.`)
        await grantKyc(
            ContractId.fromString(
                (
                    await getContractInfo(proxyContract[0])
                ).contract_id
            ),
            account,
            isED25519Type,
            clientSdk
        )
    }
    try {
        console.log(
            `Proxy created: ${proxyContract[0]} 
            , ${(await getContractInfo(proxyContract[0])).contract_id}`
        )
    } catch (error) {
        console.log(error)
    }

    try {
        console.log(
            `Proxy Admin created: ${proxyContract[1]} , ${
                (await getContractInfo(proxyContract[1])).contract_id
            }`
        )
    } catch (error) {
        console.log(error)
    }

    try {
        console.log(
            `Implementation created: ${proxyContract[2]} , ${
                (await getContractInfo(proxyContract[2])).contract_id
            }`
        )
    } catch (error) {
        console.log(error)
    }

    try {
        console.log(
            `Underlying token created: ${
                proxyContract[3]
            } , ${ContractId.fromSolidityAddress(proxyContract[3]).toString()}`
        )
    } catch (error) {
        console.log(error)
    }

    console.log(
        `Factory Proxy: ${
            (await getContractInfo(f_proxyAddress.toString())).evm_address
        }, ${f_proxyAddress}`
    )
    console.log(
        `Factory Proxy Admin: ${
            (await getContractInfo(f_proxyAdminAddress.toString())).evm_address
        }, ${f_proxyAdminAddress}`
    )
    console.log(
        `Factory Implementation: ${
            (await getContractInfo(f_address.toString())).evm_address
        }, ${f_address}`
    )

    try {
        console.log(
            `HederaReserveProxy created: ${
                proxyContract[4]
            } , ${await getHederaIdFromSolidityAddress(proxyContract[4])}`
        )
    } catch (error) {
        console.log(error)
    }

    try {
        console.log(
            `HederaReserveProxyAdmin created: ${
                proxyContract[5]
            } , ${await getHederaIdFromSolidityAddress(proxyContract[5])}`
        )
    } catch (error) {
        console.log(error)
    }
    return [
        ContractId.fromString(
            await getHederaIdFromSolidityAddress(proxyContract[0])
        ),
        ContractId.fromString(
            await getHederaIdFromSolidityAddress(proxyContract[1])
        ),
        ContractId.fromString(
            await getHederaIdFromSolidityAddress(proxyContract[2])
        ),
        f_proxyAddress,
        f_proxyAdminAddress,
        f_address,
        ContractId.fromString(
            await getHederaIdFromSolidityAddress(proxyContract[4])
        ),
        ContractId.fromString(
            await getHederaIdFromSolidityAddress(proxyContract[5])
        ),
        ContractId.fromSolidityAddress(proxyContract[3]),
    ]
}

async function getHederaIdFromSolidityAddress(
    solidityAddress: string
): Promise<string> {
    return solidityAddress != ADDRESS_ZERO
        ? (await getContractInfo(solidityAddress)).contract_id
        : '0.0.0'
}

function fixKeys(): any {
    const keyType = generateKeyType({
        adminKey: true,
        supplyKey: true,
    })

    const fixKeysToReturn = {
        keyType: keyType,
        publicKey: '0x',
        isED25519: false,
    }

    return fixKeysToReturn
}

export function tokenKeystoContract(addKyc = false) {
    const keyType = generateKeyType({
        kycKey: addKyc,
        freezeKey: true,
        wipeKey: true,
        feeScheduleKey: false,
        pauseKey: true,
        ignored: false,
    })
    const keys = [
        fixKeys(),
        {
            keyType: keyType,
            publicKey: '0x',
            isED25519: false,
        },
    ]

    return keys
}

export function tokenKeystoKey(
    publicKey: string,
    isED25519: boolean,
    addKyc = true
) {
    const PK = PublicKey.fromString(publicKey).toBytesRaw()
    const keyType = generateKeyType({
        kycKey: addKyc,
        freezeKey: true,
        wipeKey: true,
        feeScheduleKey: false,
        pauseKey: true,
        ignored: false,
    })
    const keys = [
        fixKeys(),
        {
            keyType: keyType,
            publicKey: PK,
            isED25519: isED25519,
        },
    ]

    return keys
}

export function allTokenKeystoKey(
    publicKey: string,
    isED25519: boolean,
    addKyc = true
) {
    const PK = PublicKey.fromString(publicKey).toBytesRaw()
    const keyType = generateKeyType({
        adminKey: true,
        kycKey: addKyc,
        freezeKey: true,
        wipeKey: true,
        supplyKey: true,
        feeScheduleKey: false,
        pauseKey: true,
        ignored: false,
    })
    const keys = [
        {
            keyType: keyType,
            publicKey: PK,
            isED25519: isED25519,
        },
    ]

    return keys
}

function generateKeyType({
    adminKey = false,
    kycKey = false,
    freezeKey = false,
    wipeKey = false,
    supplyKey = false,
    feeScheduleKey = false,
    pauseKey = false,
    ignored = false,
}) {
    let keyType = 0
    if (adminKey) keyType += 1
    if (kycKey) keyType += 2
    if (freezeKey) keyType += 4
    if (wipeKey) keyType += 8
    if (supplyKey) keyType += 16
    if (feeScheduleKey) keyType += 32
    if (pauseKey) keyType += 64
    if (ignored) keyType += 128

    return keyType
}

async function rolestoAccountsByKeys(
    allToContract: boolean,
    allRolesToCreator: boolean,
    CreatorAccount: string,
    isCreatorE25519: boolean,
    RolesToAccount: string,
    isRolesToAccountE25519: boolean
) {
    if (!allToContract) return []
    const RoleToAccount = allRolesToCreator
        ? await toEvmAddress(CreatorAccount, isCreatorE25519)
        : await toEvmAddress(RolesToAccount, isRolesToAccountE25519)

    const roles = [
        {
            role: BURN_ROLE,
            account: RoleToAccount,
        },
        {
            role: PAUSE_ROLE,
            account: RoleToAccount,
        },
        {
            role: WIPE_ROLE,
            account: RoleToAccount,
        },
        {
            role: FREEZE_ROLE,
            account: RoleToAccount,
        },
        {
            role: RESCUE_ROLE,
            account: RoleToAccount,
        },
        {
            role: DELETE_ROLE,
            account: RoleToAccount,
        },
        {
            role: KYC_ROLE,
            account: RoleToAccount,
        },
    ]
    return roles
}

async function cashInRoleAssignment(
    allToContract: boolean,
    allRolesToCreator: boolean,
    CreatorAccount: string,
    isCreatorE25519: boolean,
    RolesToAccount: string,
    isRolesToAccountE25519: boolean
) {
    const CashInRole = {
        account: allToContract
            ? allRolesToCreator
                ? await toEvmAddress(CreatorAccount, isCreatorE25519)
                : await toEvmAddress(RolesToAccount, isRolesToAccountE25519)
            : ADDRESS_ZERO,
        allowance: 0,
    }

    return CashInRole
}

export async function deployHederaReserve(
    initialAmountDataFeed: BigNumber,
    account: string,
    isED25519: boolean,
    clientOperator: Client,
    privateKeyOperatorEd25519: string
): Promise<ContractId[]> {
    console.log(`Deploying HederaReserve logic. please wait...`)
    const hederaReserveProxyAdmin = await deployContractSDK(
        ProxyAdmin__factory,
        privateKeyOperatorEd25519,
        clientOperator
    )

    const hederaReserve = await deployContractSDK(
        HederaReserve__factory,
        privateKeyOperatorEd25519,
        clientOperator
    )

    const params = new ContractFunctionParameters()
        .addAddress(
            (await getContractInfo(hederaReserve.toString())).evm_address
        )
        .addAddress(
            (await getContractInfo(hederaReserveProxyAdmin.toString()))
                .evm_address
        )
        .addBytes(new Uint8Array([]))

    const hederaReserveProxy = await deployContractSDK(
        TransparentUpgradeableProxy__factory,
        privateKeyOperatorEd25519,
        clientOperator,
        params
    )

    console.log(
        `Contract hederaReserve Proxy deployed ${hederaReserveProxy.toSolidityAddress()},
        Contract hederaReserve Proxy Admin deployed ${hederaReserveProxyAdmin.toSolidityAddress()},
        Contract hederaReserve Logic deployed ${hederaReserve.toSolidityAddress()}`
    )

    return [hederaReserveProxy, hederaReserveProxyAdmin, hederaReserve]
}
