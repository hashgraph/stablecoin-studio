import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'tsconfig-paths/register'
import 'hardhat-contract-sizer'
import '@openzeppelin/hardhat-upgrades'
import '@primitivefi/hardhat-dodoc'
import { Configuration, DEFAULT_EVM_VERSION, NETWORK_LIST, GAS_LIMIT } from '@configuration'
import 'solidity-coverage'
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
    defaultNetwork: NETWORK_LIST.name[0],
    networks: {
        [NETWORK_LIST.name[0]]: {
            chainId: NETWORK_LIST.chainId[0],
            hardfork: DEFAULT_EVM_VERSION,
            blockGasLimit: GAS_LIMIT.max,
        },
        [NETWORK_LIST.name[1]]: {
            chainId: NETWORK_LIST.chainId[1],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.local.jsonRpc,
            accounts: configuration.privateKeys.local,
            blockGasLimit: GAS_LIMIT.max,
            timeout: 60_000, // Increase to 60 seconds
        },
        [NETWORK_LIST.name[2]]: {
            chainId: NETWORK_LIST.chainId[2],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.previewnet.jsonRpc,
            accounts: configuration.privateKeys.previewnet,
            timeout: 120_000, // Increase to 120 seconds
        },
        [NETWORK_LIST.name[3]]: {
            chainId: NETWORK_LIST.chainId[3],
            hardfork: DEFAULT_EVM_VERSION,
            url: configuration.endpoints.testnet.jsonRpc,
            accounts: configuration.privateKeys.testnet,
            timeout: 120_000, // Increase to 120 seconds
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
    gasReporter: {
        enabled: true,
        showTimeSpent: true,
        outputFile: 'gas-report.txt', // Force output to a file
        noColors: true, // Recommended for file output
    },
    typechain: {
        outDir: './typechain-types',
        target: 'ethers-v6',
    },
    mocha: {
        timeout: 400000,
    },
}

export default hardhatConfig
