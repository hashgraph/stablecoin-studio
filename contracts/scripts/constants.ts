import { constants } from 'ethers'

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
}

// * Gas
export const GAS_LIMIT = {
    default: 3_000_000,
    low: 1_000_000,
    high: 10_000_000,
    max: 30_000_000,
    hederaTokenManager: {
        deploy: 500_000,
        grantKyc: 65_000,
    },
    stableCoinFactory: {
        deploy: 500_000,
        initialize: 130_000,
        deployStableCoin: 1_900_000,
    },
    proxyAdmin: {
        upgrade: 150_000,
    },
}
export const GAS_LIMIT_TINY = 60000
export const GAS_LIMIT_SMALL = 130000
export const GAS_LIMIT_MODERATE = 1800000
export const GAS_LIMIT_HIGH = 4800000
export const GAS_LIMIT_HIGHEST = 7800000
export const CREATE_SC_GAS = 1900000
export const CASHIN_GAS = 140000
export const BURN_GAS = 70000
export const WIPE_GAS = 70000
export const RESCUE_GAS = 70000
export const RESCUE_HBAR_GAS = 70000
export const FREEZE_GAS = 65000
export const UNFREEZE_GAS = 65000
export const REVOKE_KYC_GAS = 65000
export const UPDATE_CUSTOM_FEES_GAS = 65000
export const GET_CUSTOM_FEES_GAS = 65000
export const PAUSE_GAS = 65000
export const UNPAUSE_GAS = 65000
export const DELETE_GAS = 65000
export const GRANT_ROLES_GAS = 150000
export const REVOKE_ROLES_GAS = 85000
export const MAX_ROLES_GAS = 7000000
export const INCREASE_SUPPLY_GAS = 80000
export const DECREASE_SUPPLY_GAS = 50000
export const RESET_SUPPLY_GAS = 45000
export const UPDATE_RESERVE_ADDRESS_GAS = 45000
export const UPDATE_TOKEN_GAS = 120000
export const UPDATE_RESERVE_AMOUNT_GAS = 40000
export const CHANGE_PROXY_OWNER = 50000
export const ACCEPT_PROXY_OWNER = 40000
export const BALANCE_OF_GAS = 120000
export const GET_RESERVE_ADDRESS_GAS = 120000
export const GET_RESERVE_AMOUNT_GAS = 120000
export const GET_ROLES_GAS = 120000
export const HAS_ROLE_GAS = 120000
export const GET_SUPPLY_ALLOWANCE_GAS = 120000
export const IS_UNLIMITED_ALLOWANCE_GAS = 120000

// * Values (Payable Amounts)
export const VALUE = {
    stableCoinFactory: {
        deployStableCoin: 45,
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
            deployingFullInfrastructure: '🚀 Deploying full infrastructure...',
            associating: '🔗 Associating token...',
            associated: '🔗 Token associated!',
            grantingKyc: '🔐 Granting KYC...',
            kycGranted: '🔐 KYC granted!',
            success: '✅ Contract deployed successfully!',
            allSuccess: '🎉 All contracts deployed successfully!',
        },
        error: {
            deploy: '❌ Failed to deploy contract.',
        },
    },
    hederaTokenManager: {
        error: {
            deploy: '❌ Failed to deploy HederaTokenManager.',
            associate: '❌ Failed to associate token.',
            grantKyc: '❌ Failed to grant KYC.',
        },
    },
    stableCoinFactory: {
        error: {
            deploy: '❌ Failed to deploy StableCoinFactory.',
            initialize: '❌ Failed to initialize StableCoinFactory.',
            deployStableCoin: '❌ Failed to deploy StableCoin.',
        },
    },
}
