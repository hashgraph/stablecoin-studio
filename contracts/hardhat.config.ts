import "@nomicfoundation/hardhat-toolbox";
import "@hashgraph/hardhat-hethers";
import "@hashgraph/sdk";
const { PrivateKey } = require('@hashgraph/sdk')
require('hardhat-abi-exporter');

module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "localHederaNetwork", // The selected default network. It has to match the name of one of the configured networks.
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
      localHederaNetwork: {
        consensusNodes: [
          {
            url: "127.0.0.1:50211",
            nodeId: "0.0.3",
          },
        ],
        mirrorNodeUrl: "http://127.0.0.1:5551",
        chainId: 0,
        accounts: [
         {
           account: "0.0.2",
            privateKey:
             "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137",
          },
          // {
          //   account: "0.0.1002",
          //   privateKey:
          //     "0x7f109a9e3b0d8ecfba9cc23a3614433ce0fa7ddcc80f2a8f10b222179a5a80d6",
          // },
        ],
      },
    },
  },
  mocha: {
    timeout: 400000,
  },
};










