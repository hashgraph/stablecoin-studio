import { NetworkName } from '@configuration'

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

export const CONTRACT_NAMES_WITH_PROXY = ['BusinessLogicResolver']

export const CONTRACT_NAMES = [
    'TransparentUpgradeableProxy',
    'ProxyAdmin',
    'BusinessLogicResolver',
    // * ⬇️ Diamond Facets
    'DiamondFacet',
    'StableCoinFactoryFacet',
    'HederaTokenManagerFacet',
    'HederaReserveFacet',
    'BurnableFacet',
    'CashInFacet',
    'CustomFeesFacet',
    'DeletableFacet',
    'FreezableFacet',
    'HoldManagementFacet',
    'KYCFacet',
    'PausableFacet',
    'RescuableFacet',
    'ReserveFacet',
    'RoleManagementFacet',
    'RolesFacet',
    'SupplierAdminFacet',
    'TokenOwnerFacet',
    'WipeableFacet',
] as const

export const LOCAL_DEFAULT_ENDPOINTS = {
    jsonRpc: 'http://localhost:7546',
    mirror: 'http://localhost:5551',
}

export const HEDERA_DEFAULT_ENDPOINTS = (network: NetworkName) => {
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
    max: 15_000_000,
    default: 1_000_000,
    low: 100_000,
    high: 5_000_000,
}

// By https://docs.hedera.com/hedera/tutorials/smart-contracts/hscs-workshop/hardhat#tinybars-vs-weibars
export const WEIBARS_PER_TINYBAR = 10_000_000_000n // 10^10 (10 billion)
export const TINYBARS_PER_HBAR = 100_000_000n // 10^8 (100 million)
export const WEIBARS_PER_HBAR = WEIBARS_PER_TINYBAR * TINYBARS_PER_HBAR // 10^18 (1 quintillion)
