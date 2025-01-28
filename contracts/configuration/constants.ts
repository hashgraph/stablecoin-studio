import { Network } from '@configuration'

export const EMPTY_STRING = ''

export const DEFAULD_CHAR_INDEX = '#'
export const DEFAULT_DECIMALS = 6

export const DEFAULT_EVM_VERSION = 'london'

export const DEFAULT_MNEMONIC_PATH = "m/44'/60'/0'/0"
export const DEFAULT_MNEMONIC_LOCALE = 'en'
export const DEFAULT_MNEMONIC_COUNT = 20

export const SUFIXES = {
    typechainFactory: '__factory',
    proxy: '_PROXY',
    proxyAdmin: '_PROXY_ADMIN',
    mnemonic: '_MNEMONIC',
    privateKey: `_PRIVATE_KEY_${DEFAULD_CHAR_INDEX}`,
    jsonRpc: '_JSON_RPC_ENDPOINT',
    mirror: '_MIRROR_NODE_ENDPOINT',
}

export const NETWORK_LIST = {
    name: ['hardhat', 'local', 'previewnet', 'testnet', 'mainnet'] as const,
    chainId: [1337, 298, 297, 296, 295] as const,
}

export const DEPLOY_TYPES = ['proxy', 'direct'] as const

export const CONTRACT_NAMES_WITH_PROXY = ['StableCoinFactory']

export const CONTRACT_NAMES = [
    ...CONTRACT_NAMES_WITH_PROXY,
    'HederaTokenManager',
    'StableCoinProxyAdmin',
    'TransparentUpgradeableProxy',
] as const

export const LOCAL_DEFAULT_ENDPOINTS = {
    jsonRpc: 'http://localhost:7546',
    mirror: 'http://localhost:5551',
}

export const HEDERA_DEFAULT_ENDPOINTS = (network: Network) => {
    return `https://${network}.hashio.io/api`
}

export const MESSAGES = {
    error: {
        envNotFound: [
            '❌ Environment variable "',
            '" is not defined. Please set the "',
            '" environment variable.',
        ] as const,
    },
}

export const GAS_LIMIT = {
    max: 30_000_000,
    default: 1_000_000,
    low: 100_000,
    high: 3_000_000,
}
