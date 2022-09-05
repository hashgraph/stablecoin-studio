import "@nomicfoundation/hardhat-toolbox";
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import { PrivateKey } from "@hashgraph/sdk";
require('hardhat-abi-exporter');
require("hardhat-contract-sizer");

module.exports = {
  solidity: {
    version: "0.8.10",
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
            account: "0.0.29511696",
            publicKey: "302a300506032b6570032100f0869a0b216c9b4396714ea2ec547f5f627136afeff092b492b62425630b6495",
            privateKey: "302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be",
            isED25519Type: true
          },
          {
            // OG Account
            account: "0.0.29511696",
            privateKey:"302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be",
            publicKey:"302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be",
            isED25519Type: true
          }
        ],
      },
    },
  },
  mocha: {
    timeout: 400000,
  },
};










