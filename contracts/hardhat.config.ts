import '@nomicfoundation/hardhat-toolbox'
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-gas-reporter'
import * as dotenv from 'dotenv'
dotenv.config()

module.exports = {
    solidity: {
        version: '0.8.10',
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
                accounts: [
                    {
                        account: process.env['HEDERA_OPERATOR_ACCOUNT'] ?? '',
                        publicKey:
                            process.env['HEDERA_OPERATOR_PUBLICKEY'] ?? '',
                        privateKey:
                            process.env['HEDERA_OPERATOR_PRIVATEKEY'] ?? '',
                        isED25519Type:
                            process.env['HEDERA_OPERATOR_ED25519'] ?? true,
                    },
                    {
                        account:
                            process.env['HEDERA_NON_OPERATOR_ACCOUNT'] ?? '',
                        publicKey:
                            process.env['HEDERA_NON_OPERATOR_PUBLICKEY'] ?? '',
                        privateKey:
                            process.env['HEDERA_NON_OPERATOR_PRIVATEKEY'] ?? '',
                        isED25519Type:
                            process.env['HEDERA_NON_OPERATOR_ED25519'] ?? true,
                    },
                ],
            },
        },
    },
    mocha: {
        timeout: 400000,
    },
}
