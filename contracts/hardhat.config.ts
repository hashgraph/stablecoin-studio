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
            account: "0.0.28540472",
            privateKey:"302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69",
            publicKey:"302a300506032b657003210032c231261223d8667d841d7ca58abd9d0701eb03238a8ee4e5cdfba6925c3109",
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










