import { HardhatUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-gas-reporter'
import '@openzeppelin/hardhat-upgrades'
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import { config } from 'dotenv'
//import './scripts/hardhatTasks'

config()

const getHederaAccounts = (network: string) => [
    {
        account: process.env[`${network}_HEDERA_OPERATOR_ACCOUNT`] ?? '',
        publicKey: process.env[`${network}_HEDERA_OPERATOR_PUBLICKEY`] ?? '',
        privateKey: process.env[`${network}_HEDERA_OPERATOR_PRIVATEKEY`] ?? '',
        isED25519Type:
            process.env[`${network}_HEDERA_OPERATOR_ED25519`] ?? true,
    },
    {
        account: process.env[`${network}_HEDERA_NON_OPERATOR_ACCOUNT`] ?? '',
        publicKey:
            process.env[`${network}_HEDERA_NON_OPERATOR_PUBLICKEY`] ?? '',
        privateKey:
            process.env[`${network}_HEDERA_NON_OPERATOR_PRIVATEKEY`] ?? '',
        isED25519Type:
            process.env[`${network}_HEDERA_NON_OPERATOR_ED25519`] ?? true,
    },
]

const hhConfig: HardhatUserConfig = {
    solidity: {
        version: '0.8.16',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    defaultNetwork: 'testnet',
    hedera: {
        gasLimit: 300000,
        networks: {
            testnet: {
                accounts: getHederaAccounts('TESTNET'),
            },
            previewnet: {
                accounts: getHederaAccounts('PREVIEWNET'),
            },
            mainnet: {
                accounts: getHederaAccounts('MAINNET'),
            },
        },
    },
    mocha: {
        timeout: 400000,
    },
}

export default hhConfig
