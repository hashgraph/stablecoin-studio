import '@nomicfoundation/hardhat-toolbox'
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-gas-reporter'
import '@openzeppelin/hardhat-upgrades'
import * as dotenv from 'dotenv'
//import './scripts/hardhatTasks'
dotenv.config()

module.exports = {
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
                accounts: [
                    {
                        account:
                            process.env['TESTNET_HEDERA_OPERATOR_ACCOUNT'] ??
                            '',
                        publicKey:
                            process.env['TESTNET_HEDERA_OPERATOR_PUBLICKEY'] ??
                            '',
                        privateKey:
                            process.env['TESTNET_HEDERA_OPERATOR_PRIVATEKEY'] ??
                            '',
                        isED25519Type:
                            process.env['TESTNET_HEDERA_OPERATOR_ED25519'] ??
                            true,
                    },
                    {
                        account:
                            process.env[
                                'TESTNET_HEDERA_NON_OPERATOR_ACCOUNT'
                            ] ?? '',
                        publicKey:
                            process.env[
                                'TESTNET_HEDERA_NON_OPERATOR_PUBLICKEY'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'TESTNET_HEDERA_NON_OPERATOR_PRIVATEKEY'
                            ] ?? '',
                        isED25519Type:
                            process.env[
                                'TESTNET_HEDERA_NON_OPERATOR_ED25519'
                            ] ?? true,
                    },
                ],
            },
            previewnet: {
                accounts: [
                    {
                        account:
                            process.env['PREVIEWNET_HEDERA_OPERATOR_ACCOUNT'] ??
                            '',
                        publicKey:
                            process.env[
                                'PREVIEWNET_HEDERA_OPERATOR_PUBLICKEY'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'PREVIEWNET_HEDERA_OPERATOR_PRIVATEKEY'
                            ] ?? '',
                        isED25519Type:
                            process.env['PREVIEWNET_HEDERA_OPERATOR_ED25519'] ??
                            true,
                    },
                    {
                        account:
                            process.env[
                                'PREVIEWNET_HEDERA_NON_OPERATOR_ACCOUNT'
                            ] ?? '',
                        publicKey:
                            process.env[
                                'PREVIEWNET_HEDERA_NON_OPERATOR_PUBLICKEY'
                            ] ?? '',
                        privateKey:
                            process.env[
                                'PREVIEWNET_HEDERA_NON_OPERATOR_PRIVATEKEY'
                            ] ?? '',
                        isED25519Type:
                            process.env[
                                'PREVIEWNET_HEDERA_NON_OPERATOR_ED25519'
                            ] ?? true,
                    },
                ],
            },
        },
    },
    mocha: {
        timeout: 400000,
    },
}
