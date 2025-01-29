import { HardhatUserConfig } from 'hardhat/types'
import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import '@openzeppelin/hardhat-upgrades'
import '@primitivefi/hardhat-dodoc'
import { Configuration, DEFAULT_EVM_VERSION, GAS_LIMIT, NETWORK_LIST } from '@configuration'
import '@tasks'

export const configuration = new Configuration()

const hardhatConfig: HardhatUserConfig = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: DEFAULT_EVM_VERSION,
        },
    },
    defaultNetwork: NETWORK_LIST.name[1],
    networks: {
        [NETWORK_LIST.name[0]]: {
            chainId: NETWORK_LIST.chainId[0],
            hardfork: DEFAULT_EVM_VERSION,
            blockGasLimit: GAS_LIMIT.max,
            accounts: {
                mnemonic: configuration.mnemonic.hardhat?.phrase || undefined,
            },
            allowUnlimitedContractSize: true,
            enableRip7212: true,
            forking: {
                url: configuration.endpoints.local.jsonRpc,
                blockNumber: 4053,
                enabled: true,
            },
            // initialDate: '2025-01-27T00:00:00Z',
            // chainId: 29,
        },
        [NETWORK_LIST.name[1]]: {
            chainId: NETWORK_LIST.chainId[1],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.local.jsonRpc,
            accounts: configuration.privateKeys.local,
            blockGasLimit: GAS_LIMIT.max,
            timeout: 60000, // Increase to 60 seconds
        },
        [NETWORK_LIST.name[2]]: {
            chainId: NETWORK_LIST.chainId[2],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.previewnet.jsonRpc,
            accounts: configuration.privateKeys.previewnet,
            timeout: 60000, // Increase to 60 seconds
        },
        [NETWORK_LIST.name[3]]: {
            chainId: NETWORK_LIST.chainId[3],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.testnet.jsonRpc,
            accounts: configuration.privateKeys.testnet,
            timeout: 60000, // Increase to 60 seconds
        },
        [NETWORK_LIST.name[4]]: {
            chainId: NETWORK_LIST.chainId[4],
            url: configuration.endpoints.mainnet.jsonRpc,
            accounts: configuration.privateKeys.mainnet,
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    typechain: {
        outDir: './typechain-types',
        target: 'ethers-v5',
    },
    mocha: {
        timeout: 400000,
    },
}

export default hardhatConfig
