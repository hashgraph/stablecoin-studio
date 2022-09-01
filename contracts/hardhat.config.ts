import "@nomicfoundation/hardhat-toolbox";
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import { PrivateKey } from "@hashgraph/sdk";
require('hardhat-abi-exporter');

require('hardhat-abi-exporter');

module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "testnet", // The selected default network. It has to match the name of one of the configured networks.
  hedera: {
    gasLimit: 300000, // Default gas limit. It is added to every contract transaction, but can be overwritten if required.
    networks: {
      testnet: {
        // The name of the network, e.g. mainnet, testnet, previewnet, customNetwork
        accounts: [
          // An array of predefined Externally Owned Accounts
          {
            // OG Account
            account: "0.0.46826714",
            privateKey:"302e020100300506032b657004220420e44a917a10faa6bfb453b8773da6f85811a229112e43de8ffff521440c411c98",
            publicKey:"302a300506032b6570032100d189434ec7f8d06a89c3e4f39bc2cac80eebb8531dad335fda03520dd3edee75",
            isED25519Type: true
          },
        ],
      },
    },
  },
  mocha: {
    timeout: 400000,
  },
};










