<div align="center">

# Hedera Stable Coin

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents
- **[Overview](#Overview)**<br>
  - [Stable Coin definition](#Stable-Coin-definition)<br>
  - [Creating Stable Coins](#Creating-Stable-Coins)<br>
  - [Managing Stable Coins](#Managing-Stable-Coins)<br>
  - [Operating Stable Coins](#Operating-Stable-Coins)<br>
  - [Stable Coins categories](#Stable-Coins-categories)<br>
- **[Architecture](#Architecture)**<br>
- **[Technologies](#Technologies)**<br>
- **[Installation](#Installation)**<br>
- **[Build](#Build)**<br>
- **[Support](#Support)**<br>
- **[Contributing](#Contributing)**<br>
- **[Code of Conduct](#Code-of-Conduct)**<br>
- **[License](#License)**<br>




# Overview
This solution consists of a set of tools, including Smart Contracts, SDK, CLI and UI to facilitate the deployment and management of Stable Coins in Hedera Hashgraph.

## Stable Coin definition
A Stable Coin is a **decorator** to a standard Hedera Token.
Each stable coin maps to an *underlying* Hedera Token and adds the following functionality:

- **Multiple Roles**

  Hedera Tokens's operations (Wipe, Pause, ...) can only be performed by the accounts to which they are assigned (WipeKey, PauseKey, ...). 

  Stable Coins allow for multiple accounts to share the same operation rights, we can wipe/pause/... tokens using any of the accounts with the wipe/pause/... role respectively.

- **Supply Role split into Cash-in and Burn roles**

  The Hedera Token's supply account has the right to change the supply of the token, it can be used to mint and burn tokens.

  Stable Coins split the supply role in two, the *cash-in* and the *burn* roles which can be assigned to different accounts.

- **Cash-in role**

  When hedera tokens are minted, they are automatically assigned to the treasury account. If we want to assign them to another account, a second transaction    (signed by the treasury account) is required to transfer the tokens.

  Stable Coins implement a "cash-in" operation that allows cash-in role owners to mint and assign tokens to any account in a single transaction.
  The cash-in role comes in two flavours: 
  - *unlimited*: Accounts with the unlimited cash-in role can mint as many tokens as they wish (as long as the total supply does not exceed the max supply).
  - *limited*: Accounts with the limited cash-in role can only mint a limited number of tokens. The maximum cash-in amount is defined for each account individually and can be increased/deacreased at any time by the admin account. 


- **Rescue role**

  When the treasury account for a Stable Coin's underlying token is the main Stable Coin Smart contract itself, any token assigned to the treasury account can be managed by accounts having the *rescue* role. 
  It is important to note that the initial supply of tokens (minted when the Hedera token was created) is always assigned to the treasury account, which means that rescue role accounts will be required to transfer those tokens to other accounts.

> The account deploying the Stable Coin can be set as the administrator of the underlying token (instead of the smart contract itself), in which case, that account could completely bypass the Stable Coin and interact with the underlying token directly in order to change the keys associated to the roles. This could completely decoupled the Stable Coin from the underlying token making the above mentioned functionalities useless.

## Creating Stable Coins
Every time a stable coin is created, a new Hedera Token is created (the underlying token) and the following smart contracts are deployed:
- The Stable Coin proxy smart contract: pointing to the HederaERC20 logic smart contract that was passed as an input argument(*). Proxies are used to make stable coins upgradable.
- the Stable Coin proxy admin smart contract: this contract will act as an intermediary to upgrade the Stable Coin proxy implementation. For more information on this check the contract module's README.

(*)By default the HederaERC20 smart contract that will be used will be the one deployed by IoBuilders, but users can use any other contract they want, for more information on this check the contract module's README.

Users interact with the Stable Coin proxy smart contract because its address will never change. Stable Coin logic smart contract addresses change if a new version is deployed. 

> It is important to note that when creating a new stable coin, the user will have the possibility to specify the underlying token's keys (those that will have the wipe, supply, ... roles attached). By default those keys will be assigned to the *Stable Coin proxy smart contract* because by doing that the user will be able to enjoy the whole functionality implemented in this project through the Stable Coin logic smart contract methods. **NEVERTHELESS**, the user is free to assign any key to any account (not only during the creation process but also later, IF the user's account was set as the underlying key admin). If the user assigns a key to a different account, the Stable Coin Proxy will not be able to fully manage the underlying token, limiting the functionality it exposes to the user... It is also worth noting that just like the user will have to possibility to assign any key to any account other than the Stable Coin smart contract proxy, he/she will be able to assign it back too.

## Managing Stable Coins
Every time a stable coin is deployed, the deploying account will be defined as the Stable Coin administrator and will be granted all roles (wipe, rescue, ...). That account will have the possibility to assign and remove any role to any account, increase and decrease cash-in limits etc...

## Operating Stable Coins
Any account having any role assigned for a stable coin can operate it accordingly, for instance, if an account has the burn role assigned, it will be allowed to burn tokens. Accounts do not need to associate to the underlying token in order to operate it, they only need to be granted roles, on the other hand if they want to own tokens, they will have to associate the token as for any other Hedera token.

## Stable Coins categories
From an accounts's perspective, there are two kinds of stable coins:
 - *Internal Stable Coins*

 Every stable coin created using the account, independently of the roles the account might have.

 - *Imported Stable Coins*

Every stable coin for which the account has at least one role but was created using a different account.

# Architecture
The project is divided in 4 node modules:
````
  /contracts    
  /sdk     
  /cli                 
  /web          
````
- **`/contracts`:** The solidity smart contracts implementing the stable coin functionalities.
- **`/sdk`:** The SDK implementing the features to create, manage and operate stable coins. The SDK interacts with the Smart Contracts and exposes an API to be used by client facing applications.
- **`/cli`:** A CLI tool for creating, managing and operating stable coins. Uses the SDK exposed API.
- **`/web`:** A DAPP developed with React to create, manage and operate stable coins. Uses the SDK exposed API.

Learn more about them in their README:
- [contracts](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/contracts#readme) 
- [sdk](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/sdk#readme) 
- [cli](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/cli#readme) 
- [web](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/main/web#readme) 


# Technologies
- **Smart contracts**: Solidity version 0.8.10.
- **SDK, CLI and UI**: Typescript 4.7 or higher is highly reccomended to work with the repositories.
- **UI**: React.js 2.2.6 or higher.


# Installation
In a terminal:

````
npm install
````
This will install the dependencies in all projects and setup the links between them.

You can now start developing on any of the modules.

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

# Support
If you have a question on how to use the product, please see our
[support guide](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

# Contributing
Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of Conduct
This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License
[Apache License 2.0](LICENSE)
