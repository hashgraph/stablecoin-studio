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
            account: "0.0.47786104",
            privateKey:"302e020100300506032b657004220420b7ca8f1a5453d5c03b0d8ba99d06306ed6c93ee64d7bf122c21b0981e2b0b679",
            publicKey:"302a300506032b65700321005705625de5d5a9cdaeb85687391dc7372707c464f9e7cb0efb386cf4244ebdf6",
            isED25519Type: true
          },
          {
            // OG Account
            account: "0.0.48513659",
            privateKey:"8830990f02fae1c3a843b8510d0433a73ee47b08d56426a8e416d08727ea0609",
            publicKey:"c14dbe4c936181b7a2fe7faf086fd95bdc6900e2d19283e3e8ffd00cac1fe607",
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










