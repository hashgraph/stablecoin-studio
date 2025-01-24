import {
    CONTRACT_NAMES,
    CONTRACT_NAMES_WITH_PROXY,
    DEFAULD_CHAR_INDEX,
    DEPLOY_TYPES,
    EMPTY_STRING,
    EnvNotFoundError,
    HEDERA_DEFAULT_ENDPOINTS,
    LOCAL_DEFAULT_ENDPOINTS,
    NETWORK_LIST,
    SUFIXES,
} from '@configuration'
import dotenv from 'dotenv'

// Load the `.env` file
dotenv.config()

export type NetworName = (typeof NETWORK_LIST.name)[number]
export type NetworkChainId = (typeof NETWORK_LIST.chainId)[number]

export const NetworkNameByChainId: Record<NetworkChainId, NetworName> = NETWORK_LIST.chainId.reduce(
    (result, chainId, index) => {
        result[chainId] = NETWORK_LIST.name[index]
        return result
    },
    {} as Record<NetworkChainId, NetworName>
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
    addresses?: Record<NetworName, DeployedContract>
}

export default class Configuration {
    private _privateKeys: Record<NetworName, string[]>
    private _endpoints: Record<NetworName, Endpoints>
    private _contracts: Record<ContractName, ContractConfig>

    constructor() {
        this.initPrivateKeys()
        this.initEndpoints()
        this.initContracts()
    }

    get privateKeys(): Record<NetworName, string[]> {
        return this._privateKeys
    }

    get endpoints(): Record<NetworName, Endpoints> {
        return this._endpoints
    }

    get contracts(): Record<ContractName, ContractConfig> {
        return this._contracts
    }

    // * Private methods

    private initPrivateKeys() {
        this._privateKeys = NETWORK_LIST.name.reduce(
            (result, network) => {
                result[network] = Configuration._getEnvironmentVariableList({
                    name: `${network.toUpperCase()}${SUFIXES.privateKey}`,
                    indexChar: DEFAULD_CHAR_INDEX,
                })
                return result
            },
            {} as Record<NetworName, string[]>
        )
    }

    private initEndpoints() {
        this._endpoints = NETWORK_LIST.name.reduce(
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
            {} as Record<NetworName, Endpoints>
        )
    }

    private initContracts() {
        this._contracts = CONTRACT_NAMES.reduce(
            (result, contractName) => {
                result[contractName] = {
                    name: contractName,
                    factoryName: `${contractName}${SUFIXES.typechainFactory}`,
                    deployType: CONTRACT_NAMES_WITH_PROXY.includes(contractName) ? DEPLOY_TYPES[0] : DEPLOY_TYPES[1],
                    addresses: Configuration._getDeployedAddresses({
                        contractName,
                    }),
                }
                return result
            },
            {} as Record<ContractName, ContractConfig>
        )
    }

    /**
     * Retrieves the deployed contract addresses for a given contract name across different networks.
     *
     * @param {Object} params - The parameters object.
     * @param {ContractName} params.contractName - The name of the contract to get deployed addresses for.
     * @returns {Record<NetworName, DeployedContract>} An object mapping each network to its deployed contract details.
     *
     * The function iterates over all available networks and fetches the contract address, proxy address,
     * and proxy admin address from environment variables. If the contract address is found, it adds the
     * details to the returned object.
     */
    private static _getDeployedAddresses({
        contractName,
    }: {
        contractName: ContractName
    }): Record<NetworName, DeployedContract> {
        const deployedAddresses: Record<NetworName, DeployedContract> = {} as Record<NetworName, DeployedContract>

        NETWORK_LIST.name.forEach((network) => {
            const address = Configuration._getEnvironmentVariable({
                name: `${network.toUpperCase()}_${contractName.toUpperCase()}`,
                defaultValue: EMPTY_STRING,
            })

            if (address !== EMPTY_STRING) {
                const proxyAddress = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_${contractName}${SUFIXES.proxy}`,
                    defaultValue: EMPTY_STRING,
                })
                const proxyAdminAddress = Configuration._getEnvironmentVariable({
                    name: `${network.toUpperCase()}_${contractName}${SUFIXES.proxyAdmin}`,
                    defaultValue: EMPTY_STRING,
                })

                deployedAddresses[network] = {
                    address,
                    ...(proxyAddress !== EMPTY_STRING && { proxyAddress }),
                    ...(proxyAdminAddress !== EMPTY_STRING && {
                        proxyAdminAddress,
                    }),
                }
            }
        })

        return deployedAddresses
    }

    private static _getEnvironmentVariableList({
        name,
        indexChar = DEFAULD_CHAR_INDEX,
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
