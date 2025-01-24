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

const config: HardhatUserConfig = {
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
        },
        local: {
            url: Configuration.endpoints.local.jsonRpc,
            accounts: Configuration.privateKeys.local,
        },
        previewnet: {
            url: Configuration.endpoints.previewnet.jsonRpc,
            accounts: Configuration.privateKeys.previewnet,
        },
        testnet: {
            url: Configuration.endpoints.testnet.jsonRpc,
            accounts: Configuration.privateKeys.testnet,
        },
        mainnet: {
            url: Configuration.endpoints.mainnet.jsonRpc,
            accounts: Configuration.privateKeys.mainnet,
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

export default config
