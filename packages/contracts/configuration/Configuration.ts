import {
    CONTRACT_NAMES,
    CONTRACT_NAMES_WITH_TUP,
    CONTRACT_NAMES_WITH_RESOLVER_PROXY,
    DEFAULT_CHAR_INDEX,
    DEFAULT_MNEMONIC_COUNT,
    DEFAULT_MNEMONIC_PATH,
    DEPLOY_TYPES,
    EMPTY_STRING,
    EnvNotFoundError,
    HEDERA_DEFAULT_ENDPOINTS,
    LOCAL_DEFAULT_ENDPOINTS,
    NETWORK_LIST,
    SUFIXES,
} from '@configuration'
import dotenv from 'dotenv'
import { HDNodeWallet, Mnemonic } from 'ethers'

// Load the `.env` file
dotenv.config()

export type NetworkName = (typeof NETWORK_LIST.name)[number]
export type NetworkChainId = (typeof NETWORK_LIST.chainId)[number]

export const NetworkNameByChainId: Record<NetworkChainId, NetworkName> = NETWORK_LIST.chainId.reduce(
    (result, chainId, index) => {
        result[chainId] = NETWORK_LIST.name[index]
        return result
    },
    {} as Record<NetworkChainId, NetworkName>
)

export type DeployType = (typeof DEPLOY_TYPES)[number]

export type ContractName = (typeof CONTRACT_NAMES)[number]

export const CONTRACT_FACTORY_NAMES = CONTRACT_NAMES.map((name) => `${name}__factory`)
export type ContractFactoryName = (typeof CONTRACT_FACTORY_NAMES)[number]

export interface Endpoints {
    jsonRpc: string
    mirror: string
}

export interface DeployedContract {
    address: string
    proxyAddress?: string
    proxyAdminAddress?: string
}

export interface ContractConfig {
    name: ContractName
    factoryName: ContractFactoryName
    deployType: DeployType
    addresses?: Record<NetworkName, DeployedContract>
}

export default class Configuration {
    private _mnemonic: Record<NetworkName, Mnemonic>
    private _privateKeys: Record<NetworkName, string[]>
    private _endpoints: Record<NetworkName, Endpoints>
    private _contracts: Record<ContractName, ContractConfig>

    constructor() {
        this._mnemonic = this._initMnemonic()
        this._privateKeys = this._initPrivateKeys()
        this._endpoints = this._initEndpoints()
        this._contracts = this._initContracts()
    }

    // * Public methods
    get mnemonic(): Record<NetworkName, Mnemonic> {
        return this._mnemonic
    }

    get privateKeys(): Record<NetworkName, string[]> {
        return this._privateKeys
    }

    get endpoints(): Record<NetworkName, Endpoints> {
        return this._endpoints
    }

    get contracts(): Record<ContractName, ContractConfig> {
        return this._contracts
    }

    set contracts(contracts: Record<ContractName, ContractConfig>) {
        this._contracts = contracts
    }

    public setContractAddressList({
        contractName,
        network,
        addresses,
    }: {
        contractName: ContractName
        network: NetworkName
        addresses: DeployedContract
    }): void {
        this._contracts[contractName].addresses = {
            ...this._contracts[contractName].addresses,
            [network]: addresses,
        } as Record<NetworkName, DeployedContract>
    }

    // * Private methods
    private _initMnemonic(): Record<NetworkName, Mnemonic> {
        return NETWORK_LIST.name.reduce(
            (result, network) => {
                const phrase = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}${SUFIXES.mnemonic}`,
                    defaultValue: EMPTY_STRING,
                })
                if (phrase) {
                    result[network] = Mnemonic.fromPhrase(phrase)
                }
                return result
            },
            {} as Record<NetworkName, Mnemonic>
        )
    }

    private _initPrivateKeys(): Record<NetworkName, string[]> {
        return NETWORK_LIST.name.reduce(
            (result, network) => {
                const privateKeys = Configuration._getEnvironmentVariableList({
                    name: `${network.toUpperCase()}${SUFIXES.privateKey}`,
                    indexChar: DEFAULT_CHAR_INDEX,
                })

                if (privateKeys.length === 0) {
                    const mnemonic = this._mnemonic[network]
                    if (mnemonic?.phrase) {
                        for (let i = 0; i < DEFAULT_MNEMONIC_COUNT; i++) {
                            const wallet = HDNodeWallet.fromMnemonic(mnemonic, `${DEFAULT_MNEMONIC_PATH}/${i}`)
                            privateKeys.push(wallet.privateKey)
                        }
                    }
                }

                result[network] = privateKeys
                return result
            },
            {} as Record<NetworkName, string[]>
        )
    }

    private _initEndpoints(): Record<NetworkName, Endpoints> {
        return NETWORK_LIST.name.reduce(
            (result, network) => {
                result[network] = {
                    jsonRpc: Configuration._getEnvironmentVariable({
                        name: `${network.toUpperCase()}${SUFIXES.jsonRpc}`,
                        defaultValue:
                            network === NETWORK_LIST.name[1]
                                ? LOCAL_DEFAULT_ENDPOINTS.jsonRpc
                                : HEDERA_DEFAULT_ENDPOINTS(network),
                    }),
                    mirror: Configuration._getEnvironmentVariable({
                        name: `${network.toUpperCase()}${SUFIXES.mirror}`,
                        defaultValue:
                            network === NETWORK_LIST.name[1]
                                ? LOCAL_DEFAULT_ENDPOINTS.mirror
                                : HEDERA_DEFAULT_ENDPOINTS(network),
                    }),
                }
                return result
            },
            {} as Record<NetworkName, Endpoints>
        )
    }

    private _initContracts(): Record<ContractName, ContractConfig> {
        const contracts: Record<ContractName, ContractConfig> = {} as Record<ContractName, ContractConfig>
        CONTRACT_NAMES.forEach((contractName) => {
            contracts[contractName] = {
                name: contractName,
                factoryName: `${contractName}__factory`,
                deployType: CONTRACT_NAMES_WITH_RESOLVER_PROXY.includes(contractName)
                    ? 'resolverProxy'
                    : CONTRACT_NAMES_WITH_TUP.includes(contractName)
                      ? 'tup'
                      : 'direct',
                addresses: Configuration._getDeployedAddresses({
                    contractName,
                }),
            }
        })
        return contracts
    }

    private static _getDeployedAddresses({
        contractName,
    }: {
        contractName: ContractName
    }): Record<NetworkName, DeployedContract> {
        const deployedAddresses: Record<NetworkName, DeployedContract> = {} as Record<NetworkName, DeployedContract>

        NETWORK_LIST.name.forEach((network) => {
            const address = Configuration._getEnvironmentVariable({
                name: `${network.toUpperCase()}_${contractName.toUpperCase()}`,
                defaultValue: EMPTY_STRING,
            })

            if (address !== EMPTY_STRING) {
                const proxyAddress = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_${contractName.toUpperCase()}${SUFIXES.proxy}`,
                    defaultValue: EMPTY_STRING,
                })
                const proxyAdminAddress = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_${contractName.toUpperCase()}${SUFIXES.proxyAdmin}`,
                    defaultValue: EMPTY_STRING,
                })

                deployedAddresses[network] = {
                    address,
                    ...(proxyAddress !== EMPTY_STRING && { proxyAddress }),
                    ...(proxyAdminAddress !== EMPTY_STRING && { proxyAdminAddress }),
                }
            }
        })

        return deployedAddresses
    }

    private static _getEnvironmentVariableList({
        name,
        indexChar = DEFAULT_CHAR_INDEX,
    }: {
        name: string
        indexChar?: string
    }): string[] {
        const resultList: string[] = []
        let index = 0
        do {
            const env = Configuration._getEnvironmentVariable({
                name: name.replace(indexChar, `${index}`),
                defaultValue: EMPTY_STRING,
            })
            if (env !== EMPTY_STRING) {
                resultList.push(env)
            }
            index++
        } while (resultList.length === index)
        return resultList
    }

    private static _getEnvironmentVariable({ name, defaultValue }: { name: string; defaultValue?: string }): string {
        const value = process.env?.[name]
        if (value) {
            return value
        }
        if (defaultValue !== undefined) {
            // console.warn(
            //     `🟠 Environment variable ${name} is not defined, Using default value: ${defaultValue}`
            // )
            return defaultValue
        }
        throw new EnvNotFoundError({ envName: name })
    }
}
