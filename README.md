
# Hedera Stable Coin


## Contracts

This project aims to host smart contracts that will manage Hedera stable coin. This contracts are based on an hybrid model which uses HTS and solidity smart contracts, bringing the best of the 2 worlds.
The architecture of the contracts consists of the following:

 - `HederaERC20`: Stable coin contract.
 - `HederaERC1967Proxy`: Extends OpenZeppelin implementation of an upgradeable proxy.
 - `TokenOwner`: Token owner contract
 - `Functionality extension contracts`: Several contracts implementing functionalities that can be included in stable coin contract.

All these contracts are accompanied by other small contracts, together with their interfaces, in which part of the functionality has been extracted in order to make it available for some of the previous contracts.

### Description

These are the contents you can find in this project:

 - `contracts`: The folder containing solidity files for the contracts. Inside this folder you can also find hts-precompile and extensions folders. The first one contains both `HederaResponseCodes` contract and `HederaTokenService` contract, next to the interface of the latter. These all contracts have not been developed by ioBuilders, but by the Hedera engineering team, and this is the reason why these contracts are located in a self folder. The second one consists of those contracts that offer contract specific functionality that can be added to stable coin contracts. Finally, contracts existing in root folder constitute stable coin base functionality.
 - `scripts`: This folder contains typescript files with the funcionality needed to execute smart contracts tests, so the deployment of the contracts and the interaction with them is made possible through these files.
 - `test`: Contains previously mentioned typescript tests files.
 - `typechain-types`: The most important thing in this folder are contract factories used not only for testing, but also for any other project importing this. The content of this folder is autogenerated by `hardhat-abi-exporter` plugin whenever the user compiles the contracts.
 - `hardhat.config.ts`: hardhat configuration file.
 - `package.json`: Node project configuration file.
 - `prettier.config.js`: Several languages code formatter configuration file.
 - `README.md`
 - `tsconfig.json`: TypeScript configuration file.

### Installation

If you are in the root of the project, you should enter into contracts folder and install all packages the project depends on:

```
cd contracts
npm install
```

Once all packages are intalles, you should compile the contracts, so you have two options using `package.json` scripts:

 - Compile only those contracts which have been changed since last compilation process:

```
npm run compile
```

 - Compile all contracts although they have not been modified since lasta compilation process:

```
npm run compile:force
```

### Executing tests

Once you have carried out the installation process, and before you can execute tests, you should configure in the hardhat configuration file (`hardhat.config.ts`) accounts using in tests for the appropiate network:

    
    account: "[include your account]",
    privateKey:"[include your private key]",
    publicKey:"[include your public key]",
    isED25519Type: true
            
As in the case of compilation process, there are several ways to do it using scripts in `package.json`:

 - Executing all the tests using the configuration present in hardhat configuration file. This way, tests are executed in the network configured by existing `defaultNetwork` property, so accounts associated to this network in the configuration file can be used:
```
npm test
```
 - Executing all the tests in the indicated network:
  ```
npm test:testnet
```

In the same way, you can execute only one test:
 - In the network present in hadhat configuration file:
  ```
npm test:mintable
```

 - In the specified network:
  ```
npm test:testnet:mintable
```

### Support

Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

### Roadmap

If you have ideas for releases in the future, it is a good idea to list them in the README.

### Contributing

State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

###Authors and acknowledgment

Show your appreciation to those who have contributed to the project.

### License

For open source projects, say how it is licensed.

### Project status

If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.


