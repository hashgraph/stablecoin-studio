import { Network } from '@configuration'

export const EMPTY_STRING = ''

export const DEFAULD_CHAR_INDEX = '#'

export const SUFIXES = {
    typechainFactory: '__factory',
    proxy: '_PROXY',
    proxyAdmin: '_PROXY_ADMIN',
    privateKey: `_PRIVATE_KEY_${DEFAULD_CHAR_INDEX}`,
    jsonRpc: '_JSON_RPC_ENDPOINT',
    mirror: '_MIRROR_NODE_ENDPOINT',
}

export const NETWORKS = ['hardhat', 'local', 'previewnet', 'testnet', 'mainnet'] as const

export const DEPLOY_TYPES = ['proxy', 'direct'] as const

export const CONTRACT_NAMES_WITH_PROXY = ['Factory']

export const CONTRACT_NAMES = [...CONTRACT_NAMES_WITH_PROXY, 'HederaTokenManager'] as const

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
            'Environment variable "',
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
