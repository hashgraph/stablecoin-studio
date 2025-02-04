import { constants } from 'ethers'
import { GAS_LIMIT as CONF_GAS_LIMIT } from '@configuration'

// * Ethereum
export const ADDRESS_ZERO = constants.AddressZero
export const NUMBER_ZERO = constants.Zero
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
    withoutRole: {
        id: -1,
        hash: '0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc',
    },
}

// * Gas
export const GAS_LIMIT = {
    ...CONF_GAS_LIMIT,
    transfer: 60_000n,
    hederaTokenManager: {
        deploy: 5_000_000n,
        initialize: 60_000n,
        associate: 800_000n,
        dissociate: 800_000n,
        grantKyc: 65_000n,
        revokeKyc: 65_000n,
        burn: 70_000n,
        updateCustomFees: 65_000n,
        deleteToken: 65_000n,
        grantRole: 150_000n,
        grantRoles: 7_800_000n,
        revokeRole: 85_000n,
        revokeRoles: 7_800_000n,
        mint: 140_000n,
        freeze: 65_000n,
        unfreeze: 65_000n,
        updateToken: 120_000n,
        pause: 65_000n,
        unpause: 65_000n,
        rescue: 70_000n,
        rescueHBAR: 70_000n,
        // Read
        getMetadata: 60_000n,
        getRoles: 120_000n,
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
    },
    stableCoinFactory: {
        deploy: 5_000_000n,
        initialize: 130_000n,
        deployStableCoin: 1_900_000n,
        addHederaTokenManagerVersion: 4_800_000n,
        editHederaTokenManagerAddress: 4_800_000n,
        removeHederaTokenManagerAddress: 4_800_000n, // Added gas limit for removeHederaTokenManagerAddress
        getHederaTokenManagerAddress: 4_800_000n,
        getAdmin: 4_800_000n,
    },
    proxyAdmin: {
        upgrade: 150_000n,
    },
}

export const WIPE_GAS = 70000
export const RESCUE_HBAR_GAS = 70000
export const GET_CUSTOM_FEES_GAS = 65000
export const MAX_ROLES_GAS = 7000000
export const INCREASE_SUPPLY_GAS = 80000
export const DECREASE_SUPPLY_GAS = 50000
export const RESET_SUPPLY_GAS = 45000
export const UPDATE_RESERVE_ADDRESS_GAS = 45000
export const UPDATE_RESERVE_AMOUNT_GAS = 40000
export const CHANGE_PROXY_OWNER = 50000
export const ACCEPT_PROXY_OWNER = 40000
export const GET_RESERVE_ADDRESS_GAS = 120000
export const GET_RESERVE_AMOUNT_GAS = 120000
export const IS_UNLIMITED_ALLOWANCE_GAS = 120000

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
        },
    },
    deploy: {
        info: {
            deployFullInfrastructure: '🚀 Deploying full infrastructure...',
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
            addHederaTokenManagerVersion: '🚀 Adding HederaTokenManager version...',
            editHederaTokenManagerAddress: '✏️ Editing HederaTokenManager address...',
            removeHederaTokenManagerAddress: '🗑️ Removing HederaTokenManager address...',
        },
        success: {
            deploy: '✅ StableCoinFactory deployed successfully.',
            initialize: '✅ StableCoinFactory initialized successfully.',
            deployStableCoin: '✅ StableCoin deployed successfully.',
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
}
