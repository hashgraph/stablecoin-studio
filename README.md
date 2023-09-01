<div align="center">

# Hedera Stable Coin

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents
- **[Abstract](#Abstract)**<br>
- **[Context](#Context)**<br>
- **[Objective](#Objective)**<br>
- **[Overview](#Overview)**<br>
  - [What is a stable coin](#What-is-a-stable-coin)<br>
  - [Creating stable coins](#Creating-Stable-Coins)<br>
  - [Managing stable coins](#Managing-Stable-Coins)<br>
  - [Operating stable coins](#Operating-Stable-Coins)<br>
  - [Stable coin categories](#Stable-Coins-categories)<br>
  - [Proof of reserve](#Proof-of-reserve)<br>
- **[Architecture](#Architecture)**<br>
- **[Technologies](#Technologies)**<br>
- **[Installation](#Installation)**<br>
- **[Build](#Build)**<br>
- **[Recommendations](#Recommendations)**<br>
- **[Testnet reset procedure](#Testnet-reset-procedure)**<br>
- **[Deploying the stable coin factories](#Deploying-the-stable-coin-factories)**<br>
- **[Development manifesto](#Development-Manifesto)**<br>
- **[Support](#Support)**<br>
- **[Contributing](#Contributing)**<br>
- **[Code of conduct](#Code-of-Conduct)**<br>
- **[License](#License)**<br>

# Abstract
The Hedera stable coin accelerator is a comprehensive set of tools and resources designed to enable developers to build applications and services that make use of the stable coin. The accelerator includes smart contracts, documentation, and sample code to help developers understand how to use the accelerator and other functionality provided by the platform. With the Hedera stable coin accelerator, developers can easily integrate the stable coin into their own applications or create new applications or services that make use of the stable coin's unique features. Whether you're a seasoned cryptocurrency developer or new to the space, the Hedera stable coin accelerator has everything you need to start building with stable coins today.

# Context
As people are looking to adopt cryptocurrencies, they sometimes have their reservations about potential price volatility. This is especially true when it comes to paying for goods and services.

That is where stable coin comes in. Unlike other cryptocurrencies, stable coin are usually pegged to another currency. This means that the value of a stable coin will follow the value of that currency. Take for instance some of the most popular stable coin like Tether (USDT), USD Coin (USDC) and Binance USD (BUSD), which are all pegged to the US Dollar.

There are also some crypto backed stable coin such as DAI by MakerDAO, or commodity backed stable coin such as Paxos Gold (PAXG) by Paxos.

Stable coin have transformed the way crypto markets work by allowing traders to exchange their volatile crypto assets for a stable asset that can quickly be transferred to any other platform. If they can change the way people trade, they can also become a real breakthrough in e-commerce.

# Objective
A stable coin is a type of cryptocurrency that is designed to maintain a stable value relative to a specific asset or basket of assets. Currently, there is no out-of-the-box solution to create and manage stable coins on Hedera Hashgraph. This project aims to provide developers with the tools they need to build applications that make use of the stable coin, such as wallets, as well as documentation and sample code to help developers understand how to use the SDK and other functionality provided by the stable coin platform. With all of this, we want to enable developers to integrate the stable coin into their own applications or systems.

# Overview
This solution consists of a set of tools, including Smart Contracts, SDK, CLI and UI to facilitate the deployment and management of stable coins in Hedera Hashgraph.

## What is a stable coin
A stable coin is a **decorator** to a standard Hedera Token.
Each stable coin maps to an *underlying* Hedera Token and adds the following functionality:

- **Multiple roles**

  Hedera Tokens' operations (Wipe, Pause, ...) can only be performed by the accounts to which they are assigned (WipeKey, PauseKey, ...). 

  Stable coins allow for multiple accounts to share the same operation rights, we can wipe/pause/... tokens using any of the accounts with the wipe/pause/... role respectively.

- **Supply role split into Cash-in and Burn roles**

  The Hedera Tokens' supply account has the right to change the supply of the token, it can be used to mint and burn tokens.

  Stable coins split the supply role in two, the *cash-in* and the *burn* roles which can be assigned to different accounts.

- **Cash-in role**

  When Hedera Tokens are minted, they are automatically assigned to the treasury account. If we want to assign them to another account, a second transaction (signed by the treasury account) is required to transfer the tokens.

  Stable coins implement a "cash-in" operation that allows cash-in role owners to mint and assign tokens to any account in a single transaction.
  The cash-in role comes in two flavours: 
  - *unlimited*: Accounts with the unlimited cash-in role can mint as many tokens as they wish (as long as the total supply does not exceed the max supply).
  - *limited*: Accounts with the limited cash-in role can only mint a limited number of tokens. The maximum cash-in amount is defined for each account individually and can be increased/decreased at any time by the admin account. 


- **Rescue role**

  When the treasury account for a stable coin's underlying token is the main stable coin smart contract itself, any token assigned to the treasury account can be managed by accounts having the *rescue* role. 
  It is important to note that the initial supply of tokens (minted when the Hedera token was created) is always assigned to the treasury account, which means that rescue role accounts will be required to transfer those tokens to other accounts.

  In the same way, smart contract HBAR can also be managed by accounts having the *rescue* role. Therefore, *rescue* role accounts will be able to manage both the tokens and the HBAR of the smart contract.

> The account deploying the stable coin can be set as the administrator of the underlying token (instead of the smart contract itself), in which case, that account could completely bypass the stable coin and interact with the underlying token directly in order to change the keys associated to the roles. This would completely decouple the stable coin from the underlying token making the above-mentioned functionalities impossible.

## Creating stable coins
Every time a stable coin is created, a new Hedera Token is created (the underlying token) and the following smart contracts are deployed:
- The stable coin proxy smart contract: pointing to the `HederaTokenManager` logic smart contract that was passed as an input argument(*). Proxies are used to make stable coins upgradable.
- The stable coin proxy admin smart contract: this contract will act as an intermediary to upgrade the stable coin proxy implementation. For more information on this, check the [contract module's README](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/contracts/README.md).

An smart contract, named `StablecoinFactory`, must be previously deployed since implements the flow to create a new stable coin in a single transaction. A default `StablecoinFactory` is deployed, but any user will be able to [deploy their own factory](#Deploying-the-stable-coin-factories).

(*)By default, the HederaTokenManager smart contract that will be used will be the pre-deployed one, but users can use any other contract they want. For more information on this check the contract module's README.

Users interact with the stable coin proxy smart contract, instead of doing with the stable coin logic smart contract, because its address will never change. Stable coin logic smart contract address change if a new version is deployed. 

> It is important to note that when creating a new stable coin, the user will have the possibility to specify the underlying token's keys (those that will have the wipe, supply, ... roles attached). By default, those keys will be assigned to the *stable coin proxy smart contract* because, by doing that, the user will be able to enjoy the whole functionality implemented in this project through the stable coin logic smart contract methods. **NEVERTHELESS**, the user is free to assign any key to the public key of any account (not only during the creation process but also later, if the user's account was set as the underlying key admin), except the admin key and the supply key, that will always be automatically assigned to the stable coin proxy smart contract. If the user assigns a key to the public key of a different account, the stable coin proxy smart contract will not be able to fully manage the underlying token, limiting the functionality it exposes to the user. These keys could be even not assigned, so the related functionalities couldn't be performed. It is also worth noting that just like the user will have the possibility to assign any key to the public key of any account other than the stable coin smart contract proxy, he/she will be able to assign it back too.

## Managing stable coins
Every time a stable coin is deployed, the deploying account will be defined as the stable coin administrator and will be granted all roles (wipe, rescue, ...). That account will have the possibility to assign and remove any role to any account, increase and decrease cash-in limits, etc...

## Operating stable coins
Any account having any role granted for a stable coin can operate with it accordingly. For instance, if an account has the burn role granted, it will be allowed to burn tokens. Accounts do not need to be associate with the underlying token in order to operate with it, they only need to be granted roles. On the other hand, if they want to own tokens, they will have to associate the token as for any other Hedera token.

## Stable Coins categories
From an account's perspective, there are two kinds of stable coins:
 - *Internal stable coins*

 Every stable coin created using the account, independently of the roles the account might have.

 - *Imported stable coins*

Every stable coin for which the account has at least one role but was created using a different account.

## Proof of reserve
Under the current implementation, all stable coins may choose to implement a proof of reserve data feed at creation (new reserve data feeds can only be deployed when a stable coin has been created as part of the creation process itself. They can not be deployed independently).

> A proof of reserve is, in very simple terms, an external feed that provides the backing of the tokens in real world. This may be FIAT or other assets. 

### Setting up a proof of reserve
During setup, it is possible to link an existing data feed by providing the smart contract's address, or create a new one based on our implementation. If a reserve was created during the stable coin deployment, it will also be possible to edit the amount of the reserve.

> The initial supply of the stable coin cannot be higher than the reserve initial / current amount.

The interface the reserve data feed must implement for the stable coin to be able to interact with is the **AggregatorV3Interface** defined and used by Chainlink for its [Data Feeds](https://docs.chain.link/data-feeds/). This means that any reserve data feed implemented by Chainlink or adhering to Chainlink's standards is fully compatible with our stable coins.

Therefore, three options exist
- **Stable coin not linked to a reserve:** No known reserve collateralizing the Token. Stable coins with no reserve are technically not "stable" but just "coins".
- **Stable coin linked to a reserve but no data feed is provided:** This will deploy and initialize a reserve based on our example implementation. This reserve is meant to be used for demo purposes and allows the admin to change the reserve amount to showcase the integration between both.
- **Stable coin linked to a reserve and an existing data feed is provided**: This data feed will be used to check the reserve before minting any new tokens.

In any case, the reserve address can be edited after creation. However, changing the amount in the reserve can only be performed when the reserve smart contract was deployed during the stable coin creation.

For more information about the SDK and the methods to perform these operations, visit to the [docs](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/sdk#reserve-data-feed).

# Architecture
The project is divided in 4 node modules:
````
  /contracts    
  /sdk     
  /cli                 
  /web          
````
- **`/contracts`:** The solidity smart contracts implementing the stable coin functionalities.
- **`/sdk`:** The SDK implementing the features to create, manage and operate stable coins. The SDK interacts with the smart contracts and exposes an API to be used by client facing applications.
- **`/cli`:** A CLI tool for creating, managing and operating stable coins. Uses the SDK exposed API.
- **`/web`:** A DApp developed with React to create, manage and operate stable coins. Uses the SDK exposed API.

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

````
npm install
````
This will install the dependencies in all projects and sets up the links between them.

You can now start developing in any of the modules.

> To individual installation or running SDK/CLI/UI you can find all the information in their respective readme cited above.

# Build
When making modifications to any of the modules, you have to re-compile the dependencies, in this order, depending on which ones the modifications where made:
````bash
  // 1st
  $ npm run build:contracts
  // 2nd
  $ npm run build:sdk
  // 3rd
  $ npm run build:cli
  // or
  $ npm run build:web
````

Or within any of the modules:
````bash
  $ cd [module] // sdk, web, contracts, etc
  $ npm run build
````

# Recommendations
If you are using VSCode we recommend the use of the solidity extension from nomicFoundation, it will facilitate the use of hardhat.
[hardhat-vscode](https://github.com/NomicFoundation/hardhat-vscode)

> This may not be compatible with others solidity extensions, such as this one. [vscode-solidity](https://github.com/juanfranblanco/vscode-solidity)

# Deploying the stable coin factories
In order to be able to deploy any stable coin, the `HederaTokenManager` and `StablecoinFactory` smart contracts must be deployed on the network. Whenever a new version of these contracts is needed or when the testnet is reset, new contracts must be deployed. Moreover, the address of the `StablecoinFactory` smart contract must be updated in the SDK, CLI and web modules as explained above.

We provide default addresses for the factories that we have deployed for anyone to use that are updated whenever a new version is released.

| Contract name  | Address      | Network    | 
|----------------|--------------|------------|
| FactoryAddress | 0.0.1137631   | Testnet   |
| FactoryAddress | 0.0.XXXXXX   | Previewnet |

(You can check the factorys associated to each version [here](./FACTORY_VERSION.md))

Follow the steps in the [contracts docs](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/contracts#deploy-factory) to learn how to deploy the factories.

# Testnet reset procedure
Whenever a testnet reset occurs, the factories must be re-deployed and the addresses on the SDK must be updated.
1. Follow the steps in  [Deploying the stable coin factories](#Deploying-the-stable-coin-factories) to deploy the factories.
2. Update the addresses in SDK's `.env` file to the newly deployed factories in order to pass the SDK's tests.
3. Update the addresses in the CLI's configuration file in order to use the new factories in the CLI.
4. Update the addresses in the web's `.env` file in order to use the new factories in the DApp.
5. Create a PR to be validated and merged for the new version.

# Development manifesto
The development of the project follows enterprise-grade practices for software development. Using DDD, hexagonal architecture, and the CQS pattern, all within an agile methodology.

## Domain driven design
By using DDD (Domain-Driven Design), we aim to create a shared language among all members of the project team, which allows us to focus our development efforts on thoroughly understanding the processes and rules of the domain. This helps to bring benefits such as increased efficiency and improved communication.

## Hexagonal architecture
We employ this architectural pattern to differentiate between the internal and external parts of our software. By encapsulating logic in different layers of the application, we are able to separate concerns and promote a higher level of isolation, testability, and control over business-specific code. This structure allows each layer of the application to have clear responsibilities and requirements, which helps to improve the overall quality and maintainability of the software.

## CQS and command handlers
We use a separation of queries/commands, query handlers/command handlers to divide state changes from state reads, with the goal of decoupling functional workflows and separating view models from the domain. By using command handlers and an internal command bus, we are able to completely decouple the use cases within the system, improving flexibility and maintainability. This has been achieved by developing a fully typed TS Command / Query Handler module.

## Code standards
The SDK,CLI and UI have over 70% code coverage in unit and integration tests. The Smart Contracts have a 100% code coverage(*).

_(*) we could not find any tool to automatically measure the Smart Contracts coverage, but we included tests for all external and public methods implemented by this project (external and public methods imported from trusted external sources were not considered)._

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
