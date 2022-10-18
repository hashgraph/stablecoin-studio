import '@nomicfoundation/hardhat-toolbox'
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'

module.exports = {
    solidity: {
        version: '0.8.10',
        settings: {
            optimizer: {
                enabled: true,
                runs: 100,
            },
        },
    },
    contractSizer: {
        alphaSort: true,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    defaultNetwork: 'testnet', // The selected default network. It has to match the name of one of the configured networks.
    hedera: {
        gasLimit: 300000, // Default gas limit. It is added to every contract transaction, but can be overwritten if required.
        networks: {
            testnet: {
                // The name of the network, e.g. mainnet, testnet, previewnet, customNetwork
                accounts: [
                    // An array of predefined Externally Owned Accounts
                    {
                        // OG Account
                        account: '[include your account]',
                        privateKey: '[include your private key]',
                        publicKey: '[include your public key]',
                        isED25519Type: true,
                    },
                    {
                        account: '[include your account2]',
                        privateKey: '[include your private key2]',
                        publicKey: '[include your public key2]',
                        isED25519Type: true,
                    },
                ],
            },
            localHedera: {
                consensusNodes: [
                    {
                        url: '127.0.0.1:50211',
                        nodeId: '0.0.3',
                    },
                ],
                mirrorNodeUrl: 'http://127.0.0.1:5600',
                chainId: 298,
                accounts: [
                    // An array of predefined Externally Owned Accounts
                    {
                        account: '0.0.1012',
                        privateKey:
                            '0x105d050185ccb907fba04dd92d8de9e32c18305e097ab41dadda21489a211524',
                        isED25519Type: false,
                    },
                ],
            },
        },
    },
    mocha: {
        timeout: 400000,
    },
}
