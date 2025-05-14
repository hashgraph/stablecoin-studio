# Stablecoin Studio Smart Contracts

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE.md)

### Table of Contents

- **[Overview](#overview)**<br>
- **[Architecture](#architecture)**<br>
    - [Overall architecture](#overall-architecture)<br>
    - [Detailed architecture](#detailed-architecture)<br>
- **[Content](#content)**<br>
- **[Technologies](#technologies)**<br>
- **[Build](#build)**<br>
- **[Test](#test)**<br>
    - [Files](#files)<br>
    - [Configuration](#configuration)<br>
    - [Run](#run)<br>
- **[Deploy](#deploy)**<br>
    - [Deploy factory](#deploy-factory)<br>
    - [Create stablecoins](#create-stablecoins)<br>
- **[Upgrade](#upgrade)**<br>
    - [Upgrade factory](#upgrade-factory)<br>
    - [Upgrade stablecoins](#upgrade-stablecoins)<br>
- **[v1 to v2 Migration](#v1-to-v2-migration)**<br>
- **[Generate documentation](#generate-documentation)**<br>
- **[Other scripts](#other-scripts)**<br>
- **[Contributing](#contributing)**<br>
- **[Code of conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>

# Overview

This module contains the solidity smart contracts used in the Hedera stablecoin project.

The Hedera Token Service (HTS) functionality required in this project is exposed through an `HTS precompiled smart contract` implemented, deployed and managed by Hedera.

The smart contracts located in the `hts-precompile` folder are used to interact with the _HTS precompiled smart contract_ mentioned above, and have also been implemented and provided by Hedera. For more information about these contracts check the [Hedera Service Solidity Library](https://docs.hedera.com/guides/docs/sdks/smart-contracts/hedera-service-solidity-libraries) and the [Hedera hts precompiled contracts gitHub repository](https://github.com/hashgraph/hedera-smart-contracts/tree/main/contracts/hts-precompile):

- `HederaRespondeCodes.sol`: Contains the list of response codes the _HTS precompiled smart contract_ methods return.
- `IHederaTokenService.sol`: Interface implemented by the _HTS precompiled smart contract_. In order to execute an HTS operation, our smart contracts will need to instantiate this interface with the _HTS precompiled smart contract_ address.

The remaining smart contracts have been implemented for this project:
- Contracts within the `extensions` folder: _one contract for each stablecoin operation_.
  - `BurnableFacet.sol`: implements the _burn_ operation (burns tokens from the treasury account. Decreases the total supply).
  - `CashInFacet.sol`: implements the _cash-in_ operation (mints new tokens and transfers them to an account. Increases the total supply).
  - `DeletableFacet.sol`: implements the _delete_ operation (deletes the stablecoin's underlying token).  
    **WARNING**: THIS OPERATION CANNOT BE ROLLED BACK. A stablecoin WITHOUT AN UNDERLYING TOKEN WILL NOT WORK ANYMORE.
  - `FreezableFacet.sol`: implements the _freeze_ and _unfreeze_ operations (if the token is frozen for an account, this account will not be able to operate with the stablecoin until unfrozen).
  - `KYCFacet.sol`: implements the _grantKyc_ and _revokeKyc_ operations to grant or revoke the KYC flag to a Hedera account for the stablecoin.
  - `PausableFacet.sol`: implements the _pause_ and _unpause_ operations (if a token is paused, no one will be able to operate with it until unpaused).
  - `RescatableFacet.sol`: implements the _rescue_ and _rescueHBAR_ operations (transfers tokens and HBAR, respectively, from the treasury account—being the stablecoin’s smart contract—to another account).
  - `ReserveFacet.sol`: implements the reserve logic for the stablecoin (checks against the current reserve before minting, allows updating the reserve data feed, etc.).  
    The reserve address can be set to `0.0.0` (zero address) to disable the reserve mechanism.
  - `RoleManagementFacet.sol`: implements the _grantRoles_ and _revokeRoles_ operations (grants and revokes multiple roles to/from multiple accounts in a single transaction).
  - `RolesFacet.sol`: contains the definition of the roles that can be assigned to each stablecoin.
  - `SupplierAdminFacet.sol`: implements the management of the _cash-in_ role (assigning/removing the role and setting, increasing, or decreasing the cash-in limit).
  - `TokenOwnerFacet.sol`: stores the addresses of the _HTS precompiled smart contract_ and the _underlying token_ related to the stablecoin. All other facets rely on this.
  - `WipeableFacet.sol`: implements the _wipe_ operation (burns tokens from any account. Decreases the total supply).
  - `HoldManagementFacet.sol`: implements the _hold_ functionality, enabling temporary locking of tokens under the control of an escrow address. This is used in scenarios like secondary market trades or regulatory compliance.
- Important contracts within the `resolver` folder:
  - `BusinessLogicResolver.sol`: central contract that maps function selectors to facet addresses. All stablecoin proxies delegate the selector resolution to this resolver, enabling centralized upgradeability across all stablecoins.
  - `ResolverProxy.sol`: lightweight diamond clone that delegates execution to the correct facet based on the mapping returned by the `BusinessLogicResolver`.
  - `BusinessLogicResolverWrapper.sol`: helper contract to simplify interaction with the resolver.

- `HederaReserveFacet.sol`: implements the ChainLink AggregatorV3Interface to provide the current data about the stablecoin's reserve.
- `HederaTokenManagerFacet.sol`: defines the main logic to initialize and manage a stablecoin. It exposes key ERC-20-like read functions (`name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`) and supports on-chain metadata and token updates via HTS.
- `StableCoinFactoryFacet.sol`: implements the flow to create a new stablecoin. Every time a new stablecoin is created, several smart contracts must be deployed and initialized and an underlying token must be created through the `HTS precompiled smart contract`. this multi-transaction process is encapsulated in this contract so that users can create new stablecoins in a single transaction. **IMPORTANT** : a factory contract will be deployed in tesnet for anybody to use. Users are also free to deploy and use their own factory contract.
- These last three contracts have their own interfaces in the `Interfaces` folder.

> 💡 Each stablecoin is deployed as a diamond clone (via `ResolverProxy`) and uses a shared `BusinessLogicResolver` to dynamically delegate logic calls. This enables centralized logic upgrades across all stablecoins with a single transaction.

# Architecture

## Overall architecture

![](./img/StableCoinArchitecture1.png)

# Content

These are the folders and files you can find in this project:

- `contracts`: The folder with the solidity files. Inside this folder you can also find the _hts-precompile_ and the _extensions_ folders, including this last one an interface folder, presented in the **[Overview](#Overview)** section.
- `docs`: Detailed documentation for each smart contract in the "contracts" folder.
- `scripts`: Typescript files used to create new stablecoins and deploy required smart contracts. These files are used when testing.
- `test`: Typescript tests files.
- `typechain-types`: the most important thing in this folder are contract factories which are used not only for testing, but also by any other project importing the stablecoin solution. The content of this folder is autogenerated by `hardhat-abi-exporter` plugin whenever the user compiles the contracts.
- `.env`: environment file used in tests execution.
- `.eslintrc.json`: ESLint tool configuration file for linting JavaScript code.
- `.solhint.json`: Solhint tool configuration file for linting solidity code.
- `hardhat.SignatureServiceConfig.ts`: hardhat configuration file.
- `package.json`: Node project configuration file.
- `prettier.config.js`: several languages code formatter configuration file.
- `README.md`
- `Slither`: folder containing everything related to the slither analysis.
- `tsconfig.json`: TypeScript configuration file.
- `tslint.json`: TSLint tool configuration file for linting TypeScript code.

# Technologies

The IDE we use in this project is **Hardhat**, in order to use it you must have:

- [Hardhat](https://hardhat.org/docs)
- [node (version 16)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

The smart contract programming language is **Solidity** version 0.8.16.

# Build

First download and install the project dependencies :

1. Run `cd contracts`. This will change your current working directory to the `contracts` folder.
2. Run `npm install`. This will create and populate `node_modules`.

Then compile and build the contracts, you can choose one of the following options:

1. Run `npm run compile` to compile the contracts that were modified after the last compilation (This will NOT build the package, you need to run step 3)
2. Run `npm run compile:force` to compile all the contracts (even those that were not modified after the last compilation) and build the package (you can skip step 3).
3. run `npm run build` to build the package without compiling the contracts.

The first two commands will generate a `build` folder that contains a `typechain-types` folder. This folder contains the contracts wrappers that allows us to access contracts abi importing the wrappers as shown below:

```code
import { hederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts/typechain-types';
```

# Test

Each test follows the _arrange, act, assert_ pattern and is self-contained, ensuring full independence and allowing them to run in parallel and in any order.

## Files

Typescript test files are located in the `test` folder and are organized into two parallel execution threads:
- `Thread0/`
- `Thread1/`

## Execution

Tests are designed to run in parallel, but they can also be executed individually for debugging or focused testing.  
For example:

```bash
npm run test:customFees
# or directly
npx hardhat test test/thread0/customFees.test.ts
```

## Configuration

### Test accounts

You need to create the `.env` file cloning the content of `.env.sample` and add **two Hedera accounts** that will be used for testing.

These accounts must be existing valid accounts in the **Hedera network** you are using to test the smart contracts, they must also have a **positive balance large enough** to run all the contract deployments, invocations and token creations executed in the tests.

For each account you must provide the Private Key (7647657eerr65....878)

Example for the Hedera testnet (_fake data_):

```.env
    # * Accounts and Keys
    # Private keys in RAW Format (Not DER)
    # local
    LOCAL_PRIVATE_KEY_0='0xEXAMPLEPRIVATEKEY0'
    LOCAL_PRIVATE_KEY_1='0xEXAMPLEPRIVATEKEY1'
    # testnet
    TESTNET_PRIVATE_KEY_0='0xEXAMPLEPRIVATEKEY4'
    TESTNET_PRIVATE_KEY_1='0xEXAMPLEPRIVATEKEY5'
    # ... add more keys as needed
    
```

### Operating accounts

All tests will use the two above mentioned accounts.

- `Operator Account (PRIVATE_KEY_0)`: This is the account that will deploy the stablecoin used for testing. It will have full rights.
- `Non Operator Account (PRIVATE_KEY_1)`: This is the account that will NOT deploy the stablecoin used for testing. It will have no rights to the stablecoin unless explicitly granted during the test.

### Pre-deployed factory & hederaTokenManager contracts

Tests use a factory and a HederaTokenManager contract to create the stablecoins.

- If you want to deploy a new factory and HederaTokenManager every time: scripts -> deploy.ts -> hederaTokenManagerAddress = "" / factoryProxyAddress = "" / factoryProxyAdminAddress = "" / factoryAddress = ""
- If you want to re-use a factory and hederaTokenManager : Set the Hedera ContractIds in scripts -> deploy.ts -> hederaTokenManagerAddress /factoryProxyAddress / factoryProxyAdminAddress / factoryAddress

> If you set the factory contracts addresses as described above, the tests included in the "stableCoinFactory.ts" file might not work because they will try to upgrade the factory implementation and the accounts used for that (those defined in the "hardhat.SignatureServiceConfig.ts") might not have the right to do it.

## Run

There are several ways to run the tests using the commands defined in the `package.json` file (according to the configuration defined in `hardhat.SignatureServiceConfig.ts`):

- Run all the test files in the `defaultNetwork` network:

```shell
npm test
```

- Run all the test files in a specific network (Hedera TestNet):

```shell
npm run test:testnet
```

- Run a single test file in the `defaultNetwork` network:

```shell
npm run test:mintable
```

- Run a single test file in a specific network (Hedera PreviewNet):

```shell
npm run test:previewnet:mintable
```

> The accounts used to test will be determined by the values in the `.env` file, that must contain the `HEDERA_OPERATOR_` entries for the account id, public / private key and evm address. See the `.env.sample` file to see all the attributes. See [Test accounts](#Test-accounts) to learn more.

# Deploy

The stablecoin solution is made of two major components.

- **The factory** : Smart contracts encapsulating the complexity of the creation of new stablecoins.
- **The stablecoin** : Smart contracts that are deployed by the factory, exposing the functionalities and services of the stablecoin solution and interacting with an underlying token.

In order to create stablecoins, a Factory and a hederaTokenManager contracts must be deployed first. Once deployed, creating stablecoins will be as simple as invoking the "deployStableCoin" method of the Factory passing the token basic information and the hederaTokenManager contract address as input arguments.

> A factory and hederaTokenManager contracts will be provided for everybody to use in the testnet network. The address of the factory proxy is configured both in the CLI configuration file and in the web environment file. On the contrary, hederaTokenManager implementations depends on the factory, so the factory smart contract has functions to manage hederaTokenmanager smart contracts versions.

## Deploy factory

If you want to deploy your own Factory contracts do the following steps:

1. Deploy the Factory **Logic** smart contract (_StableCoinFactory.sol_).
2. Deploy the Factory **Proxy Admin** smart contract.
3. Deploy the Factory **TransparentUpgradeableProxy** smart contract setting the Factory logic as the implementation and the Factory proxy admin as the admin. _**DO NOT FORGET** to add the Factory proxy admin **EVM** address to the "memo" field of the TransparentUpgradeableProxy contract_.

> To enable `deployFactory` task in hardhat, it's necessary to un comment in `hardhat.config.ts` the line 10.

You may also clone this repository, install the dependencies (see [Build](#Build)) and run `npx hardhat deployFactory` in order to deploy all factories (hederaTokenManager and stableCoinFactory) and its proxies onto the testnet network. Once completed, an output with the new addresses is provided:

```
Proxy address:           0.0.7110
Proxy admin address:     0.0.7108
Factory address:         0.0.7106
hederaTokenManager address:     0.0.7102
```

> The account used to deploy will be determined by the values in the `.env` file, that must contain the `HEDERA_OPERATOR_` entries for the account id, public / private key and evm address. See the `.env.sample` file to see all the attributes. See [Test accounts](#Test-accounts) to learn more.

## Create stablecoins

Once the factory has been deployed (or if you are using the common factory), creating stablecoins is very simple, just invoke one single method of the Factory's Logic (through the Factory's Proxy): `deployStableCoin(...)`

> it can be easily done from the CLI and/or UI of the project, for more information on that check their respective README.md

These are the steps the creation method will perform when creating a new stablecoin:

- Deploy **stablecoin proxy admin smart contract** (from the Open Zeppelin library).
- Transfer the stablecoin Proxy Admin ownership to the sender account.
- Deploy **stablecoin proxy smart contract** (from the Open Zeppelin library) setting the implementation contract (*the hederaTokenManager contract's address you provided as an input argument) and the admin (*stablecoin proxy admin smart contract\*).
- Initializing the stablecoin proxy. The initialization will create the underlying token.
- Associating the token to the deploying account.
- Granting the KYC to the account for the token, only if the user configured a KYC key in the token when created.

# Upgrade

In order to make all our smart contract's implementation upgradable, we are using the _Transparent Proxy_ pattern combined with the _Proxy admin_ pattern, both from OpenZeppelin. You can find more information about these two patterns [here](https://docs.openzeppelin.com/contracts/4.x/api/proxy#transparent_proxy).

It is also important to note that, in order to avoid future overlapping of state variable due to the inheritance process, we use the _storage gap_ strategy from OpenZeppelin, you can find more information about this strategy [here](https://docs.openzeppelin.com/contracts/3.x/upgradeable#storage_gaps).

The factory's and the stablecoins's logic can be upgraded at any time using the account that was used to either deploy it the first time (for the factory) or create it (for the stablecoins).

## Upgrade factory

- Deploy the new factory logic contract.
- Invoke the `upgradeAndCall` method of the factory proxy admin passing the previously deployed factory logic contract's address and any data required to initialize it. If you do not need to pass any initialization data, you can simply invoke the `upgrade` method passing the previously deployed factory logic contract's address. **=> USE THE FACTORY PROXY'S ADMIN OWNER ACCOUNT TO PERFORM THIS TASK. BY DEFAULT THAT ACCOUNT WILL BE THE ONE ORIGINALLY USED TO DEPLOY THE FACTORY.**

## Upgrade stablecoins

> These steps must be performed individually for every single stablecoin you wish to upgrade. It is not possible to upgrade all stablecoins at once since they are completely independent of each other:

- Deploy the new stablecoin logic contract (_hederaTokenManager_).
- Invoke the `upgradeAndCall` method of the stablecoin proxy admin passing the previously deployed stablecoin logic contract's address and any data required to initialize it. If you do not need to pass any initialization data, you can simply invoke the `upgrade` method passing the previously deployed stablecoin logic contract's address. **=> USE THE stablecoin PROXY'S ADMIN ACCOUNT TO PERFORM THIS TASK. BY DEFAULT THAT ACCOUNT WILL BE THE ONE ORIGINALLY USED TO CREATE THE stablecoin.**

# Change ProxyAdmin Owner

The _Transparent Proxy admin_ also allows to change the owner who can manage the proxy, like upgrading it, as explained above.
Initially, the account deploying the factory contract will be the proxy admin owner of this contract, while the user creating the stablecoin will be able to select the account id (can be a contract id) during the stablecoin creation process, which will be the owner of the stablecoin proxy admin contract.

# V1 to V2 Migration
In order to migrate V1 Stablecoins to V2 you need to :

- Enter the private key of the account set as `owner` in your Stablecoin's `Proxy admin` in the `MAINNET_PRIVATE_KEY_0` field of the `.env`file.
- Then run the following hardhat task: 

```
npx hardhat migrateStableCoinToV2 --stablecoinconfigurationidkey CONFIG_ID --stablecoinconfigurationidversion CONFIG_VERSION --businesslogicresolverproxyaddress BLR --stablecoinaddress SC_PROXY --stablecoinproxyadminaddress SC_PROXY_ADMIN
```

Where

    - CONFIG_ID: config id of the stablecoin  (bytes32)
    - CONFIG_VERSION: config version of the stablecoin (integer)
    - BLR: Business logic resolver address (evm address)
    - SC_PROXY: address of the stablecoin's proxy (evm address)
    - SC_PROXY_ADMIN: address of the stablecoin's admin proxy (evm address)



# Generate documentation

Documentation files of all contracts, in Markdown format, can be generated using the following command:

```shell
npm run doc
```

Generated files will be stored in the `docs` folder.

# Manage factory

Some scripts have been developed to manage the stablecoin factory.

- Add a new TokenManager address to stablecoin factory:

```shell
npx hardhat addNewVersionTokenManager --tokenManager <HederaId> --proxyfactory <HederaId>
```

- Update an TokenManager address:

```shell
npx hardhat addNewVersionTokenManager --tokenManager <HederaId> --proxyfactory <HederaId> --index <number>
```

- Remove an TokenManager address:

```shell
npx hardhat addNewVersionTokenManager --proxyfactory <HederaId> --index <number>
```

- Get TokenManager address saved in factory:

```shell
npx hardhat getTokenManager --proxyfactory <HederaId>
```

- Deploy a new TokenManager implementation:

```shell
npx hardhat deployTokenManager
```

# Other scripts

In addition to the compilation, build, test and documentation scripts we have already covered, there are other scripts configured in `package.json` file:

Checks the contracts size in KiB.

```shell
npm run size
```

Lints Solidity code.

```shell
npm run lint:sol
```

Lints TypeScript code.

```shell
npm run lint:ts
```

Lints Solidity and TypeScript code.

```shell
npm run lint
```

Formats TypeScript, JavaScript and Solidity files code.

```shell
npm run prettier
```

Executes prettier and lint commands.

```shell
npm run pre-commit
```

Launches slither security report.

```shell
npm run slither
```

# Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License

[Apache License 2.0](../LICENSE.md)
