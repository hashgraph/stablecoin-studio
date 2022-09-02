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
            account: "[include your account]",
            privateKey:"[include your private key]",
            publicKey:"[include your public key]",
            isED25519Type: true
          },
          {
            // OG Account
            account: "[include your account]",
            privateKey:"[include your private key]",
            publicKey:"[include your public key]",
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










