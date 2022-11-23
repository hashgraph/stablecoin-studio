import "@nomicfoundation/hardhat-toolbox";
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "@primitivefi/hardhat-dodoc";
import "hardhat-gas-reporter"


module.exports = {
  solidity: {
    version: "0.8.10",
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
            account: "[include your account]",
            publicKey: "[include your private key]",
            privateKey: "[include your public key]",
            isED25519Type: true
          },
          {
            account: "[include your account]",
            privateKey:"[include your private key]",
            publicKey:"[include your public key]",
            isED25519Type: true
          },
          {
            account: "[include your account]",
            publicKey: "[include your private key]",
            privateKey: "[include your public key]",
            isED25519Type: true
          },
          {
            account: "[include your account]",
            publicKey: "[include your private key]",
            privateKey: "[include your public key]",
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










