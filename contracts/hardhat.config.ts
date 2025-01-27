import { HardhatUserConfig } from 'hardhat/types'
import 'tsconfig-paths/register'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import '@openzeppelin/hardhat-upgrades'
import '@primitivefi/hardhat-dodoc'
import { Configuration, GAS_LIMIT } from '@configuration'
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
            evmVersion: 'istanbul',
        },
    },
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 1337,
            blockGasLimit: GAS_LIMIT.max,
            accounts: {
                mnemonic: configuration.mnemonic.hardhat.phrase,
            },
        },
        local: {
            url: configuration.endpoints.local.jsonRpc,
            accounts: configuration.privateKeys.local,
        },
        previewnet: {
            url: configuration.endpoints.previewnet.jsonRpc,
            accounts: configuration.privateKeys.previewnet,
        },
        testnet: {
            url: configuration.endpoints.testnet.jsonRpc,
            accounts: configuration.privateKeys.testnet,
        },
        mainnet: {
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
