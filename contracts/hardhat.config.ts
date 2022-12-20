import '@nomicfoundation/hardhat-toolbox'
import '@hashgraph/hardhat-hethers'
import '@hashgraph/sdk'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import '@primitivefi/hardhat-dodoc'
import 'hardhat-gas-reporter'

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
    networks: {
        testnet: {
            url: 'https://testnet.hashio.io/api',
            accounts: [
                '0x3c8055953320b1001b93f6c99518ec0a1daf7210f1bb02dd11c64f3dec96fdb6',
            ],
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
                        // ED25519 Account
                        account: '0.0.49046006',
                        privateKey:
                            '77989f3fd05a7c07d6f9079c7c42bf4ba82bb50d407d31f04fc0752d0e971a08',
                        publicKey:
                            '879322bde34f791681d99d2cc7c2adc76973dd94b92c8e0267188c9904de9283',
                        isED25519Type: true,
                    },
                    {
                        // ECDSA Account
                        account: '0.0.48587748',
                        privateKey:
                            '3c8055953320b1001b93f6c99518ec0a1daf7210f1bb02dd11c64f3dec96fdb6',
                        publicKey:
                            '024d7906cba70ad272e93b94f2bbd4276b55cb3172403013973071163a6b7656a0',
                        isED25519Type: false,
                    },
                    {
                        account: '0.0.47786104',
                        privateKey:
                            '302e020100300506032b657004220420b7ca8f1a5453d5c03b0d8ba99d06306ed6c93ee64d7bf122c21b0981e2b0b679',
                        publicKey:
                            '302a300506032b65700321005705625de5d5a9cdaeb85687391dc7372707c464f9e7cb0efb386cf4244ebdf6',
                        isED25519Type: true,
                    },
                    {
                        account: '0.0.30912800',
                        publicKey:
                            '302a300506032b657003210015f9f8de4dba357635db0c204c37d21ee33f31d44570267b34812a45d260cdb2',
                        privateKey:
                            '302e020100300506032b657004220420f329d5e5b9e7560a90bf726748266ff1020b3509a534b5f4a505b1de53bd2c9e',
                        isED25519Type: true,
                    },
                    {
                        account: '0.0.30806753',
                        publicKey:
                            '302a300506032b657003210062f5000787e884883525b2eedf9b6037b45696380d74099771bd57413f513602',
                        privateKey:
                            '302e020100300506032b657004220420d1b6ec8c780c7a4bb4f1a8dc85e85ed0022a1b30e10ac5cfff2586a3c456d586',
                        isED25519Type: true,
                    },
                ],
            },
        },
    },
    mocha: {
        timeout: 400000,
    },
}
