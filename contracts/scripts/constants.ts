import { GAS_LIMIT as CONF_GAS_LIMIT } from '@configuration'
import { ZeroAddress, parseUnits } from 'ethers'

// * General
export const CONFIG_ID = {
    stableCoinFactory: '0x0000000000000000000000000000000000000000000000000000000000000001',
    stableCoin: '0x0000000000000000000000000000000000000000000000000000000000000002',
    reserve: '0x0000000000000000000000000000000000000000000000000000000000000003',
}
export const DEFAULT_CONFIG_VERSION = 1

// * Ethereum
export const ADDRESS_ZERO = ZeroAddress
export const NUMBER_ZERO = 0n
export const UINT256_MAX = (1n << 256n) - 1n

// * Hedera
export const HBAR_DECIMALS = 8n
export const HBAR_FACTOR = 10n ** HBAR_DECIMALS
export const ONE_HBAR = parseUnits('1', 'ether') // Amount in HBAR (1 HBAR = 1 ether unit)
export const TWO_HBAR = parseUnits('2', 'ether') // Amount in HBAR (1 HBAR = 1 ether unit)

// * Roles
export const ROLES = {
    defaultAdmin: {
        id: 0,
        hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    cashin: {
        id: 1,
        hash: '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
    },
    burn: {
        id: 2,
        hash: '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22',
    },
    wipe: {
        id: 3,
        hash: '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
    },
    rescue: {
        id: 4,
        hash: '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
    },
    pause: {
        id: 5,
        hash: '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d',
    },
    freeze: {
        id: 6,
        hash: '0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d',
    },
    delete: {
        id: 7,
        hash: '0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2',
    },
    kyc: {
        id: 8,
        hash: '0xdb11624602202c396fa347735a55e345a3aeb3e60f8885e1a71f1bf8d5886db7',
    },
    customFees: {
        id: 9,
        hash: '0x6db8586688d24c6a6367d21f709d650b12a2a61dd75e834bd8cd90fd6afa794b',
    },
    hold: {
        id: 10,
        hash: '0xa0edc074322e33cf8b82b4182ff2827f0fef9412190f0e8417c2669a1e8747e4',
    },
    withoutRole: {
        id: -1,
        hash: '0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc',
    },
}

// * Gas
export const GAS_LIMIT = {
    ...CONF_GAS_LIMIT,
    transfer: 60_000n,
    initialize: {
        businessLogicResolver: 8_000_000,
    },
    hederaTokenManager: {
        deploy: 5_000_000n,
        facetDeploy: 5_500_000n,
        initialize: 60_000n,
        associate: 800_000n,
        dissociate: 800_000n,
        grantKyc: 90_000n,
        revokeKyc: 80_000n,
        burn: 100_000n,
        updateCustomFees: 100_000n,
        deleteToken: 90_000n,
        grantRole: 150_000n,
        grantRoles: 7_800_000n,
        grantSupplierRole: 7_800_000n,
        grantUnlimitedSupplierRole: 7_800_000n,
        revokeRole: 85_000n,
        revokeRoles: 7_800_000n,
        revokeSupplierRole: 7_800_000n,
        addRoleToList: 150_000n,
        removeRoleFromList: 150_000n,
        getRoleList: 150_000n,
        mint: 200_000n,
        freeze: 90_000n,
        unfreeze: 80_000n,
        updateToken: 170_000n,
        pause: 80_000n,
        unpause: 80_000n,
        rescue: 120_000n,
        rescueHBAR: 100_000n,
        wipe: 150_000n,
        increaseSupplierAllowance: 100_000n,
        decreaseSupplierAllowance: 100_000n,
        resetSupplierAllowance: 80_000n,
        updateReserveAddress: 80_000n,
        // Read
        getMetadata: 80_000n,
        getRoles: 150_000n,
        hasRole: 120_000n,
        getAccountsWithRole: 120_000n,
        isUnlimitedSupplierAllowance: 60_000n,
        name: 60_000n,
        symbol: 60_000n,
        decimals: 60_000n,
        totalSupply: 60_000n,
        getTokenAddress: 1_800_000n,
        balanceOf: 120_000n,
        getSupplierAllowance: 120_000n,
        getReserveAmount: 100_000n,
        getReserveAddress: 60_000n,
    },
    stableCoinFactory: {
        deploy: 5_000_000n,
        initialize: 130_000n,
        deployStableCoin: 4_200_000n,
        addHederaTokenManagerVersion: 4_800_000n,
        editHederaTokenManagerAddress: 4_800_000n,
        removeHederaTokenManagerAddress: 4_800_000n, // Added gas limit for removeHederaTokenManagerAddress
        changeAdmin: 4_800_000n,
        // Read
        getHederaTokenManagerAddress: 4_800_000n,
        getAdmin: 4_800_000n,
    },
    proxyAdmin: {
        deploy: 2_000_000n,
        upgrade: 200_000n,
    },
    tup: {
        deploy: 2_000_000n,
        upgrade: 200_000n,
    },
    resolverProxy: {
        deploy: 2_000_000n,
        upgrade: 200_000n,
    },
    hederaReserve: {
        initialize: 180_000n,
        setAdmin: 1_800_000n,
        setAmount: 60_000n,
        // Read
        latestRoundData: 60_000n,
        decimals: 60_000n,
        description: 60_000n,
        version: 60_000n,
    },
    businessLogicResolver: {
        deploy: 9_000_000n,
        getStaticResolverKey: 60_000,
        registerBusinessLogics: 7_800_000,
        createConfiguration: 15_000_000,
    },
    migrationProxy: {
        deploy: 2_000_000n,
        upgrade: 200_000n,
    },
    diamondCutManager: {
        createConfiguration: 140_000n,
    },
    diamondFacet: {
        deploy: 3_500_000n,
        updateConfigVersion: 80_000n,
        updateConfig: 80_000n,
        updateResolver: 80_000n,
    },
    hold: {
        facetDeploy: 6_000_000n,
        createHoldByController: 150_000n,
        executeHold: 1_000_000n,
        releaseHold: 500_000n,
        reclaimHold: 400_000n,
    },
}

// * Values (Payable Amounts)
export const VALUE = {
    stableCoinFactory: {
        deployStableCoin: 45_000_000_000_000_000_000n,
    },
}

// * Messages
export const MESSAGES = {
    blockchain: {
        error: {
            validateTxResponse: ['❌ Failed to validate transaction response.', ' Transaction Hash: '],
            signerWithoutProvider: '❌ Signer is missing a provider.',
            couldNotFindWallet: '🔍 Could not find wallet for signer.',
            businessLogicResolverAddressRequired: '❌ Business logic resolver address is required.',
            configurationIdRequired: '❌ Configuration ID is required.',
            configurationVersionRequired: '❌ Configuration version is required.',
            rolesStructRequired: '❌ Roles struct is required.',
            nameOrFactoryRequired: '❌ Name or factory parameters are required.',
        },
    },
    deploy: {
        info: {
            deployFullInfrastructure: '🚀 Deploying full infrastructure...',
            deployFullInfrastructureInTests: '🏗️ Deploying full infrastructure or using previously deployed...',
        },
        success: {
            deployFullInfrastructure: '🎉 Full infrastructure deployed successfully.',
        },
        error: {
            deploy: '❌ Failed to deploy contract.',
        },
    },
    hederaTokenManager: {
        info: {
            deploy: '🚀 Deploying HederaTokenManager...',
            associate: '🔗 Associating token...',
            grantKyc: '🔐 Granting KYC...',
        },
        success: {
            deploy: '✅ HederaTokenManager deployed successfully.',
            associate: '✅ Token associated successfully.',
            grantKyc: '✅ KYC granted successfully.',
        },
        error: {
            deploy: '❌ Failed to deploy HederaTokenManager.',
            associate: '❌ Failed to associate token.',
            dissociate: '❌ Failed to dissociate token.',
            grantKyc: '❌ Failed to grant KYC.',
        },
    },
    stableCoinFactory: {
        info: {
            deploy: '🚀 Deploying StableCoinFactory...',
            initialize: '🚀 Initializing StableCoinFactory...',
            deployStableCoin: '🚀 Deploying StableCoin...',
            deployFactoryResolverProxy: '🚀 Deploying StableCoinFactory Resolver Proxy...',
            addHederaTokenManagerVersion: '🚀 Adding HederaTokenManager version...',
            editHederaTokenManagerAddress: '✏️ Editing HederaTokenManager address...',
            removeHederaTokenManagerAddress: '🗑️ Removing HederaTokenManager address...',
        },
        success: {
            deploy: '✅ StableCoinFactory deployed successfully.',
            initialize: '✅ StableCoinFactory initialized successfully.',
            deployStableCoin: '✅ StableCoin deployed successfully.',
            deployFactoryResolverProxy: '✅ StableCoinFactory Resolver Proxy deployed successfully.',
            addHederaTokenManagerVersion: '✅ HederaTokenManager version added successfully.',
            editHederaTokenManagerAddress: '✅ HederaTokenManager address edited successfully.',
            removeHederaTokenManagerAddress: '✅ HederaTokenManager address removed successfully.', // Added success message for removeHederaTokenManagerAddress
        },
        error: {
            deploy: '❌ Failed to deploy StableCoinFactory.',
            initialize: '❌ Failed to initialize StableCoinFactory.',
            deployStableCoin: '❌ Failed to deploy StableCoin.',
            addHederaTokenManagerVersion: '❌ Failed to add HederaTokenManager version.',
            editHederaTokenManagerAddress: '❌ Failed to edit HederaTokenManager address.',
            removeHederaTokenManagerAddress: '❌ Failed to remove HederaTokenManager address.', // Added error message for removeHederaTokenManagerAddress
        },
    },
    businessLogicResolver: {
        info: {
            initialize: 'Initializing business logic resolver...',
            register: 'Registering business logics...',
            createConfigurations: 'Creating configurations...',
        },
        success: {
            initialize: '✅ Business logic resolver initialized successfully',
            register: '✅ Business logics registered successfully',
            createConfigurations: '✅ Configurations created successfully',
        },
        error: {
            notFound: 'Business logic resolver not found',
            proxyNotFound: 'Business logic resolver proxy not found',
            initialize: 'Error initializing business logic resolver',
            register: 'Error registering business logics',
            createConfigurations: 'Error creating configurations',
        },
    },
}

// * Events
export const EVENTS = {
    businessLogicResolver: {
        registered: 'BusinessLogicsRegistered',
        configurationCreated: 'DiamondBatchConfigurationCreated',
    },
}

// * Default Values
export const DEFAULT_TOKEN = (() => {
    const decimals = 6n
    const tokenFactor = 10n ** decimals
    return {
        memo: 'Example Token Memo',
        name: 'ExampleToken',
        symbol: 'EXMPL',
        decimals,
        tokenFactor,
        initialSupply: tokenFactor * 100n,
        maxSupply: tokenFactor * 1_000n,
        initialAmountDataFeed: (tokenFactor * 100_000n).toString(),
        additionalData: 'Some additional data here',
        freeze: false,
    }
})()

export const ONE_TOKEN = DEFAULT_TOKEN.tokenFactor
export const TEN_TOKENS = DEFAULT_TOKEN.tokenFactor * 10n

export const HEDERA_PRECOMPILED_ADDRESS = '0x0000000000000000000000000000000000000167'
