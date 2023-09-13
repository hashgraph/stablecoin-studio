<div align="center">

# Stablecoin Studio

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents

- **[Abstract](#abstract)**<br>
- **[Context](#context)**<br>
- **[Objective](#objective)**<br>
- **[Overview](#overview)**<br>
  - [What is a stablecoin](#what-is-a-stablecoin)<br>
  - [Creating stablecoins](#creating-stablecoins)<br>
  - [Managing stablecoins](#managing-stablecoins)<br>
  - [Operating stablecoins](#operating-stablecoins)<br>
  - [Stablecoin categories](#stablecoins-categories)<br>
  - [Proof of reserve](#proof-of-reserve)<br>
- **[Architecture](#architecture)**<br>
- **[Technologies](#technologies)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Recommendations](#recommendations)**<br>
- **[Testnet reset procedure](#testnet-reset-procedure)**<br>
- **[Deploying the stablecoin factories](#deploying-the-stablecoin-factories)**<br>
- **[Development manifesto](#development-manifesto)**<br>
- **[Support](#support)**<br>
- **[Contributing](#contributing)**<br>
- **[Code of conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>

# Abstract

The Hedera Stablecoin Studio is a comprehensive set of tools and resources designed to enable developers to build applications and services that make use of the stablecoin. The project includes smart contracts, documentation, and sample code to help developers understand how to use the project and other functionality provided by the platform. With the Hedera Stablecoin studio, developers can easily integrate the stablecoin into their own applications or create new applications or services that make use of the stablecoin's unique features. Whether you're a seasoned cryptocurrency developer or new to the space, the Hedera stablecoin accelerator has everything you need to start building with stablecoins today.

# Context

As people are looking to adopt cryptocurrencies, they sometimes have their reservations about potential price volatility. This is especially true when it comes to paying for goods and services.

That is where stablecoin comes in. Unlike other cryptocurrencies, stablecoin are usually pegged to another currency. This means that the value of a stablecoin will follow the value of that currency. Take for instance some of the most popular stablecoin like Tether (USDT), USD Coin (USDC) and Binance USD (BUSD), which are all pegged to the US Dollar.

There are also some crypto backed stablecoin such as DAI by MakerDAO, or commodity backed stablecoin such as Paxos Gold (PAXG) by Paxos.

Stablecoin have transformed the way crypto markets work by allowing traders to exchange their volatile crypto assets for a stable asset that can quickly be transferred to any other platform. If they can change the way people trade, they can also become a real breakthrough in e-commerce.

# Objective

A stablecoin is a type of cryptocurrency that is designed to maintain a stable value relative to a specific asset or basket of assets. Currently, there is no out-of-the-box solution to create and manage stablecoins on Hedera Hashgraph. This project aims to provide developers with the tools they need to build applications that make use of the stablecoin, such as wallets, as well as documentation and sample code to help developers understand how to use the SDK and other functionality provided by the stablecoin platform. With all of this, we want to enable developers to integrate the stablecoin into their own applications or systems.

# Overview

This solution consists of a set of tools, including Smart Contracts, SDK, CLI and UI to facilitate the deployment and management of stablecoins in Hedera Hashgraph.

## What is a stablecoin

A stablecoin is a **decorator** to a standard Hedera Token.
Each stablecoin maps to an _underlying_ Hedera Token and adds the following functionality:

- **Multiple roles**

  Hedera Tokens' operations (Wipe, Pause, ...) can only be performed by the accounts to which they are assigned (WipeKey, PauseKey, ...).

  Stablecoins allow for multiple accounts to share the same operation rights, we can wipe/pause/... tokens using any of the accounts with the wipe/pause/... role respectively.

- **Supply role split into Cash-in and Burn roles**

  The Hedera Tokens' supply account has the right to change the supply of the token, it can be used to mint and burn tokens.

  Stablecoins split the supply role in two, the *cash-in* and the *burn* roles which can be assigned to different accounts.

- **Cash-in role**

  When Hedera Tokens are minted, they are automatically assigned to the treasury account. If we want to assign them to another account, a second transaction (signed by the treasury account) is required to transfer the tokens.

  Stablecoins implement a "cash-in" operation that allows cash-in role owners to mint and assign tokens to any account in a single transaction.
  The cash-in role comes in two flavours:

  - _unlimited_: Accounts with the unlimited cash-in role can mint as many tokens as they wish (as long as the total supply does not exceed the max supply).
  - _limited_: Accounts with the limited cash-in role can only mint a limited number of tokens. The maximum cash-in amount is defined for each account individually and can be increased/decreased at any time by the admin account.

- **Rescue role**

  When the treasury account for a stablecoin's underlying token is the main stablecoin smart contract itself, any token assigned to the treasury account can be managed by accounts having the _rescue_ role.
  It is important to note that the initial supply of tokens (minted when the Hedera token was created) is always assigned to the treasury account, which means that rescue role accounts will be required to transfer those tokens to other accounts.

  In the same way, smart contract HBAR can also be managed by accounts having the _rescue_ role. Therefore, _rescue_ role accounts will be able to manage both the tokens and the HBAR of the smart contract.

> The account deploying the stablecoin can be set as the administrator of the underlying token (instead of the smart contract itself), in which case, that account could completely bypass the stablecoin and interact with the underlying token directly in order to change the keys associated to the roles. This would completely decouple the stablecoin from the underlying token making the above-mentioned functionalities impossible.

## Creating stablecoins

Every time a stablecoin is created, a new Hedera Token is created (the underlying token) and the following smart contracts are deployed:

- The stablecoin proxy smart contract: pointing to the `HederaTokenManager` logic smart contract that was passed as an input argument(\*). Proxies are used to make stablecoins upgradable.
- The stablecoin proxy admin smart contract: this contract will act as an intermediary to upgrade the stablecoin proxy implementation. For more information on this, check the [contract module's README](https://github.com/hashgraph/stablecoin-studio/tree/main/contracts/README.md).

An smart contract, named `StablecoinFactory`, must be previously deployed since implements the flow to create a new stablecoin in a single transaction. A default `StablecoinFactory` is deployed, but any user will be able to [deploy their own factory](#deploying-the-stablecoin-factories).

(\*)By default, the HederaTokenManager smart contract that will be used will be the pre-deployed one, but users can use any other contract they want. For more information on this check the contract module's README.

Users interact with the stablecoin proxy smart contract, instead of doing with the stablecoin logic smart contract, because its address will never change. stablecoin logic smart contract address change if a new version is deployed.

> It is important to note that when creating a new stablecoin, the user will have the possibility to specify the underlying token's keys (those that will have the wipe, supply, ... roles attached). By default, those keys will be assigned to the _stablecoin proxy smart contract_ because, by doing that, the user will be able to enjoy the whole functionality implemented in this project through the stablecoin logic smart contract methods. **NEVERTHELESS**, the user is free to assign any key to the public key of any account (not only during the creation process but also later, if the user's account was set as the underlying key admin), except the admin key and the supply key, that will always be automatically assigned to the stablecoin proxy smart contract. If the user assigns a key to the public key of a different account, the stablecoin proxy smart contract will not be able to fully manage the underlying token, limiting the functionality it exposes to the user. These keys could be even not assigned, so the related functionalities couldn't be performed. It is also worth noting that just like the user will have the possibility to assign any key to the public key of any account other than the stablecoin smart contract proxy, he/she will be able to assign it back too.

## Managing stablecoins

Every time a stablecoin is deployed, the deploying account will be defined as the stablecoin administrator and will be granted all roles (wipe, rescue, ...). That account will have the possibility to assign and remove any role to any account, increase and decrease cash-in limits, etc...

## Operating stablecoins

Any account having any role granted for a stablecoin can operate with it accordingly. For instance, if an account has the burn role granted, it will be allowed to burn tokens. Accounts do not need to be associate with the underlying token in order to operate with it, they only need to be granted roles. On the other hand, if they want to own tokens, they will have to associate the token as for any other Hedera token.

## Stablecoins categories

From an account's perspective, there are two kinds of stablecoins:

- _Internal stablecoins_

Every stablecoin created using the account, independently of the roles the account might have.

- _Imported stablecoins_

Every stablecoin for which the account has at least one role but was created using a different account.

## Proof of reserve

Under the current implementation, all stablecoins may choose to implement a proof of reserve data feed at creation (new reserve data feeds can only be deployed when a stablecoin has been created as part of the creation process itself. They can not be deployed independently).

> A proof of reserve is, in very simple terms, an external feed that provides the backing of the tokens in real world. This may be FIAT or other assets.

### Setting up a proof of reserve

During setup, it is possible to link an existing data feed by providing the smart contract's address, or create a new one based on our implementation. If a reserve was created during the stablecoin deployment, it will also be possible to edit the amount of the reserve.

> The initial supply of the stablecoin cannot be higher than the reserve initial / current amount.

The interface the reserve data feed must implement for the stablecoin to be able to interact with is the **AggregatorV3Interface** defined and used by Chainlink for its [Data Feeds](https://docs.chain.link/data-feeds/). This means that any reserve data feed implemented by Chainlink or adhering to Chainlink's standards is fully compatible with our stablecoins.

Therefore, three options exist

- **stablecoin not linked to a reserve:** No known reserve collateralizing the Token. stablecoins with no reserve are technically not "stable" but just "coins".
- **stablecoin linked to a reserve but no data feed is provided:** This will deploy and initialize a reserve based on our example implementation. This reserve is meant to be used for demo purposes and allows the admin to change the reserve amount to showcase the integration between both.
- **stablecoin linked to a reserve and an existing data feed is provided**: This data feed will be used to check the reserve before minting any new tokens.

In any case, the reserve address can be edited after creation. However, changing the amount in the reserve can only be performed when the reserve smart contract was deployed during the stablecoin creation.

For more information about the SDK and the methods to perform these operations, visit to the [docs](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/sdk#reserve-data-feed).

# Architecture

The project is divided in 4 node modules:

```
  /contracts
  /sdk
  /cli
  /web
```

- **`/contracts`:** The solidity smart contracts implementing the stablecoin functionalities.
- **`/sdk`:** The SDK implementing the features to create, manage and operate stablecoins. The SDK interacts with the smart contracts and exposes an API to be used by client facing applications.
- **`/cli`:** A CLI tool for creating, managing and operating stablecoins. Uses the SDK exposed API.
- **`/web`:** A DApp developed with React to create, manage and operate stablecoins. Uses the SDK exposed API.

Learn more about them in their README:

- [contracts](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/contracts/README.md)
- [sdk](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/sdk/README.md)
- [cli](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/cli/README.md)
- [web](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/web/README.md)

# Technologies

- **Smart contracts**: Solidity version 0.8.16 (and lower versions for contracts imported from external sources like OpenZeppelin).
- **SDK, CLI and UI**: Typescript `>=4.7`
- **SDK**: Node `>= v18.13`
- **UI**: React.js `>=2.2.6`
- **CONTRACTS**: Hardhat `^2.14.0`

# Installation

In a terminal:

Before intstalling, its needed to execute the command below in order to configure repository for @hashgraph-dev in npm.

```bash
npm config set @hashgraph-dev:registry=https://us-npm.pkg.dev/hedera-registry/stablecoin-npm/
```

This will install the dependencies in all projects and sets up the links between them.

```
npm install
```

You can now start developing in any of the modules.

> To individual installation or running SDK/CLI/UI you can find all the information in their respective readme cited above.

# Build

When making modifications to any of the modules, you have to re-compile the dependencies, in this order, depending on which ones the modifications where made:

```bash
  // 1st
  $ npm run build:contracts
  // 2nd
  $ npm run build:sdk
  // 3rd
  $ npm run build:cli
  // or
  $ npm run build:web
```

Or within any of the modules:

```bash
  $ cd [module] // sdk, web, contracts, etc
  $ npm run build
```

# Recommendations

If you are using VSCode we recommend the use of the solidity extension from nomicFoundation, it will facilitate the use of hardhat.
[hardhat-vscode](https://github.com/NomicFoundation/hardhat-vscode)

> This may not be compatible with others solidity extensions, such as this one. [vscode-solidity](https://github.com/juanfranblanco/vscode-solidity)

# Deploying the stablecoin factories
In order to be able to deploy any stablecoin, the `HederaTokenManager` and `StablecoinFactory` smart contracts must be deployed on the network. Whenever a new version of these contracts is needed or when the testnet is reset, new contracts must be deployed. Moreover, the address of the `StablecoinFactory` smart contract must be updated in the SDK, CLI and web modules as explained above.

We provide default addresses for the factories that we have deployed for anyone to use that are updated whenever a new version is released.

| Contract name  | Address      | Network    | 
|----------------|--------------|------------|
| FactoryAddress | 0.0.1137631   | Testnet   |
| FactoryAddress | 0.0.XXXXXX   | Previewnet |

(You can check the factorys associated to each version [here](./FACTORY_VERSION.md))

Follow the steps in the [contracts docs](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/contracts#deploy-factory) to learn how to deploy the factories.

# Testnet reset procedure

Whenever a testnet reset occurs, the factories must be re-deployed and the addresses on the SDK must be updated.

1. Follow the steps in [Deploying the stablecoin factories](#deploying-the-stablecoin-factories) to deploy the factories.
2. Update the addresses in SDK's `.env` file to the newly deployed factories in order to pass the SDK's tests.
3. Update the addresses in the CLI's configuration file in order to use the new factories in the CLI.
4. Update the addresses in the web's `.env` file in order to use the new factories in the DApp.
5. Create a PR to be validated and merged for the new version.

# Fees
All fees are subject to change. The fees below reflect a base price for the transaction or query. Transaction characteristics may increase the price from the base price shown below. The following table reflects the cost that the transaction have through the Smart Contracts.

| Operation  | Dollar      | Gas    | 
|----------------|--------------|------------|
| Cash in | 0.01$   | 101.497    |
| Burn | 0.005$   | 60.356 |
| Wipe | 0.005$   | 60.692 |
| Freeze | 0.005$  | 56.261 |
| Unfreeze | 0.005$   | 56.262 |
| Grant KyC | 0.005$   | 56.167 |
| Revoke KyC | 0.005$   | 56.195 |

# JSON-RPC Relays
Anyone in the community can set up their own JSON RPC relay that applications can use to deploy, query, and execute smart contracts. You can use your local RPC-relay following this [instructions](https://github.com/hashgraph/hedera-json-rpc-relay) or you can use one of the community-hosted Hedera JSON RPC relays like:
- [Hashio](https://swirldslabs.com/hashio/)
- [Arkhia](https://www.arkhia.io/features/#api-services)
- [ValidationCloud](https://docs.validationcloud.io/v1/hedera/json-rpc-relay-api)

# Development manifesto

The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design

By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.

## Hexagonal architecture

We employ this architectural pattern to differentiate between the internal and external parts of our software. By encapsulating logic in different layers of the application, we are able to separate concerns and promote a higher level of isolation, testability, and control over business-specific code. This structure allows each layer of the application to have clear responsibilities and requirements, which helps to improve the overall quality and maintainability of the software.

## CQS and command handlers

We use a separation of queries/commands, query handlers/command handlers to divide state changes from state reads, with the goal of decoupling functional workflows and separating view models from the domain. By using command handlers and an internal command bus, we are able to completely decouple the use cases within the system, improving flexibility and maintainability. This has been achieved by developing a fully typed TS Command / Query Handler module.

## Code standards

The SDK,CLI and UI have over 70% code coverage in unit and integration tests. The Smart Contracts have a 100% code coverage(\*).

_(\*) we could not find any tool to automatically measure the Smart Contracts coverage, but we included tests for all external and public methods implemented by this project (external and public methods imported from trusted external sources were not considered)._

# Support

If you have a question on how to use the product, please see our
[support guide](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

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

[Apache License 2.0](LICENSE)
