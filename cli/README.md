<div align="center">

# Stablecoin Studio - Command Line Interface (CLI)

[![CLI - Test](https://github.com/hashgraph/stablecoin-studio/actions/workflows/cli.test.yml/badge.svg)](https://github.com/hashgraph/stablecoin-studio/actions/workflows/cli.test.yml)

</div>

### Table of contents

- [Pre-requirements](#pre-requirements)
- [Steps](#steps)
- [Starting the CLI](#starting-the-cli)
- [Automatically creating a config file](#automatically-creating-a-config-file)
- [Manually creating a config file](#manually-creating-a-config-file)
- [Factories ](#factories)
- [CLI flow](#cli-flow)
  - [Main menu](#main-menu)
    - [Create a new stablecoin](#create-a-new-stablecoin)
    - [Manage imported tokens](#manage-imported-tokens)
    - [Operate with stablecoin](#operate-with-stablecoin)
    - [List stablecoins](#list-stablecoins)
    - [Configuration](#configuration)
- [Jest](#jest)
- [Run](#run)

# Overview

The Command Line Interface (CLI) uses the API exposed by the SDK to create, manage and operate stablecoins. It is meant as a "demo tool" to showcase the project's functionalities.

# Installation

The command below can be used to install the official release from the NPM repository. This version may not reflect the most recent changes to the main branch of this repository.

```bash
npm install -g @hashgraph/stablecoin-npm-cli
```

Once installed globally you can use the `accelerator wizard` command to run the CLI.

```bash
accelerator wizard
```

# Build

## Pre-requirements

You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13`
- [npm](https://www.npmjs.com/)

Then you must install and build the following projects :

1. [Contract installation](https://github.com/hashgraph/stablecoin-studio/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md#installation)
3. [Hashconnect installation](https://github.com/hashgraph/stablecoin-studio/blob/main/hashconnect/lib/README.md#installation)

## Steps

From the root of the CLI project workspace:

- Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
- Run `npm start`. This will display the CLI options.
- Run `npm run start:wizard`. To start the CLI in wizard mode creating a config file in the project folder.

# Quickstart

## Starting the CLI

The first time you execute the `accelerator wizard` command in your terminal, if you haven't added your default configuration path the interface will ask you whether you want to create a new configuration file in the default path. When the configuration file is created you must configure the default network, operating accounts and the factory contract id. In order to create the default account you can use [HashPack](https://www.hashpack.app/download), [Blade](https://bladewallet.io/) or the [Hedera Developer Portal](https://portal.hedera.com/register).

https://github.com/hashgraph/stablecoin-studio/assets/108128685/73c2ed6c-ebc4-4717-b837-c4595c007ba0

_Note that for testing purpose you should create a **Testnet** account instead of Mainnet account. Everything executed on Mainnet will incur a cost with real money._

# Usage

To use the CLI correctly it is necessary to generate a configuration file in which the default network, their associated accounts and the factory contract id will be included. These parameters can be modified later on, from the CLI.

## Automatically creating a config file

The configuration file that is automatically generated populates its fields using the answers to the questions displayed in the CLI when the application is started for the first time.
The file format is .yaml and the structure is as follows:

```
defaultNetwork: testnet
networks:
  - name: mainnet
    consensusNodes: []
  - name: previewnet
    consensusNodes: []
  - name: testnet
    consensusNodes: []
accounts:
  - accountId: ''
    privateKey: 
      key: ''
      type: ''
    network: ''
    alias: ''
    importedTokens: []
mirrors:
  - name: HEDERA
    network: testnet
    baseUrl: https://testnet.mirrornode.hedera.com/api/v1/
    selected: true
  - name: HEDERA
    network: previewnet
    baseUrl: https://previewnet.mirrornode.hedera.com/api/v1/
    selected: true
  - name: HEDERA
    network: mainnet
    baseUrl: https://mainnet-public.mirrornode.hedera.com/api/v1/
    selected: true
rpcs:
  - name: HASHIO
    network: testnet
    baseUrl: https://testnet.hashio.io/api
    selected: true
  - name: HASHIO
    network: previewnet
    baseUrl: https://previewnet.hashio.io/api
    selected: true
  - name: HASHIO
    network: mainnet
    baseUrl: https://mainnet.hashio.io/api
    selected: true
logs:
  path: './logs'
  level: 'ERROR'
factories: 
  - id: '0.0.14455068'
    network: 'testnet'
  - id: '0.0.765432'
    network: 'previewnet'
```
## Manually creating a config file

A config file can be manually created using the "hsca-config.sample.yaml" file as a template. Follow this steps:

- **Copy/Paste** the "hsca-config.sample.yaml" file
- **Rename** it "hsca-config.yaml"
- **Fill** it like
  - **defaultNetwork** : choose between mainnet, testnet and previewnet.
  - **networks** : _(Optional)_ for each network:
    - **consensusNodes** : list of consensus nodes **urls** and their respective **node Ids**.
    - **chainId** : network chain Id.
  - **accounts** : _(Mandatory at least one)_ list of accounts.
    - **accountId** : Account's Hedera Id.
    - **network** : Network in which the account exists, choose between mainnet, testnet and previewnet.
    - **alias** : Account unique alias.
    - **privateKey** : account's private **key** and private key **type** (choose between ED25519 and ECDSA).
    - **importedTokens** : _(Optional)_ list of imported tokens for the account. For each imported token we must specify the token **id**, **symbol** and the list of **roles** the account's has been granted for the token.
  - **mirrors** : _(Mandatory at least one)_ list of mirror nodes.
    - **name** : Mirror node unique name.
    - **network** : Network assigned to this mirror node url, choose between mainnet, testnet and previewnet.
    - **baseUrl** : Mirror node url.
    - **selected** : _true_ if this is the currently selected mirror, _false_ otherwise. At least one mirror node must be selected.
    - **apiKey** : _(Optional)_ API Key that must be provided to the mirror node in order to authenticate the request.
    - **headerName** : _(Optional)_ http header name that will contain the API Key.
  - **rpcs** : _(Mandatory at least one)_ list of RPC nodes.
    - **name** : RPC node unique name.
    - **network** : Network assigned to this RPC node url, choose between mainnet, testnet and previewnet.
    - **baseUrl** : RPC node url.
    - **selected** : _true_ if this is the currently selected RPC, _false_ otherwise. At least one RPC node must be selected.
    - **apiKey** : _(Optional)_ API Key that must be provided to the RPC node in order to authenticate the request.
    - **headerName** : _(Optional)_ http header name that will contain the API Key.
  - **logs** : 
    - **path** : log file path. Typically './logs'
    - **level** : log level ERROR, TRACE, ...
  - **factories** : list of factories, at most one per network.
    - **id** : Factory Id.
    - **network** : Network where the factory exists, choose between mainnet, testnet and previewnet.
    
## Factories 

We provide default addresses for the factories that we have deployed for anyone to use that are updated whenever a new version is released.

| Contract name  | Address      | Network    |
| -------------- | ------------ | ---------- |
| FactoryAddress | 0.0.14455068 | Testnet    |
| FactoryAddress | 0.0.XXXXXX   | Previewnet |

## CLI flow

![CLI Flow](https://github.com/hashgraph/stablecoin-studio/assets/56278409/f75b66ab-b6d9-48f9-92b0-1c2a2af68556)

When the CLI is started with the configuration file properly configured, the first action will be to select the account you want to operate with. By default, the list of configured accounts belonging to the default network indicated in the configuration file, is displayed.

If there are no accounts in the file for the default network, a warning message will be displayed and a list of all the accounts in the file will be displayed.

When an account is selected, the main menu is displayed. The network the account belongs to will be set.

### Main menu

When your configuration file is set up and at least one account is added and selected, you are able to see the different options that are available.

#### Create a new stablecoin

In order to use this option you must set a factory first.
You can check our factories deployed in [our documentation](https://github.com/hashgraph/stablecoin-studio#deploying-the-stable-coin-factories).

With this option you are able to create a new stablecoin adding the mandatory details like name and symbol.

> The auto-renew account is not requested since is automatically set to be the user's current account, otherwise the stablecoin creation will not work, this is due to the fact that the auto-renew account must sign the underlying token's creation transaction, and currently we do not support multi-signatures transactions.

After the minimum details have been added, you will be asked if you want to add optional details like the number of decimals, the initial supply or the max supply. If you reply "no", the default values will be set.

Another question is prompt asking if you would like the smart contract to be set as the owner of all the underlying token keys (pause, wipe, ...), you could however set any key you wish as the owner of any token key, except for the admin key and the supply key that will be automatically set to be the smart contract.

After managing token keys, you will be asked about to enable the KYC. If so, all accounts will need that the KYC to be granted in order to operate with the stablecoin, and the token KYC key will be requested. Finally, you will be able to request the KYC to be granted to the current account during the stablecoin creationg process. On the contrary, if you decide no to enable the KYC, the token KYC key will not be set and no account will need the KYC to be grante in order to operate with the stablecoin.

Next, you will be requested about the possibility of adding custom fees to the token once it is created. If so, the token fee schedule key will be requested so the owner of this key will be able to add custom fees to the token. Otherwise, no one will be able to add any token custom fees.

Once all the token keys are set, for all keys that were set to be the smart contract, you will be able to grant and revoke this capacity to any other account through roles, since it is the smart contract that will be ultimately controlling the underlying token. Therefore, for all the underlying token's keys assigned to the smart contract, you can choose to grant its corresponding role to the current account deploying the SC or any other.

When you add an existing stablecoin as an imported token, you will be able to operate with the roles that the stablecoin's admin granted you. If after adding a stablecoin you are granted other roles, you will have the possibility to refresh the stablecoin's roles that you have.

Then you will have the possibility to set a **Proof of Reserve feed (PoR)** for your stablecoin. A PoR is a smart contract that connects your on-chain stablecoin to your off-chain fiat currency supply. The idea is to have an on-chain representation of the amount of fiat currency currently collateralizing your stablecoin, this amount is called the **"Reserve"**.
The PoR smart contract will store at all time the current reserve so that the stablecoin can check it before minting new tokens.
The Wizard will give you the possibility to link your stablecoin to an already existing PoR smart contract or, if you do not have any, deploy a new one setting an initial Reserve. 

> It is important to note that, if you choose to deploy a new PoR for your stablecoin, your current account will be set as the PoR admin, meaning that it will have the possibility to update the Reserve and upgrade the smart contract code at any time. Nevertheless, the CLI will only let you deploy the PoR and link it to your stablecoin, in order to operate the new PoR (update the Reserve etc...) or change the PoR your stablecoin is linked to, you will have to use the UI...

> It is also important to note that the PoR you deploy using our tools is purely for demo purposes. Chainlink implements a complex, secure and reliable decentralize off-chain system to manage the PoR reserves, whereas, as specified above, our PoR can be fully managed by your account.

_For more information about PoR Feeds, check the official [ChainLink documentation](https://docs.chain.link/data-feeds/proof-of-reserve/)._

Last question about the stablecoin it is going to be created is about the proxy admin owner. By default, this ownership belongs to the account creating the stablecoin, but the user has the chance to change this default behaviour by configuring another account id, which can belongs to a contract, like a timelock controller, a cold wallet, or whatever account.

Once the request is ready, the CLI will extract from the configuration file the factory and HederaTokenManager contracts addresses for the network you are working on.
The request will then be submitted to the SDK and the stablecoin will be created.

> When the configuration file is first created, the factory contract added to the "testnet" network are the default one (pre-deployed contract). However, users are free to deploy and use their own contracts, in order to do that, the configuration file must be updated with the new factory contract id.

https://github.com/hashgraph/stablecoin-studio/assets/108128685/dde74619-8c48-40b7-a0ff-3553214fa819

#### Manage imported tokens

Stablecoins that we have not created with our account but for which we have been assigned one or several roles must be imported in order to operate them.

1. Add token
2. Refresh token
3. Remove token

#### Operate with stablecoin

Once a stablecoin is created or added, you can operate with it.

The following list contains all the possible operations a user can perform if he/she has the appropriate role.

- **Send tokens**: transfer tokens to other accounts.
- **Cash in**: mints tokens and transfers them to an account. If you have linked a PoR Feed to your stablecoin, this operation will fail in two cases : 
  - if you try to mint more tokens than the total Reserve (1 to 1 match between the token's total supply and the Reserve)
  - if you try to mint tokens using more decimals than the Reserve has, for instance, minting 1.001 tokens when the Reserve only has 2 decimals.
  > this DOES NOT mean that a stablecoin can not have more decimals than the Reserve, transfers between accounts can use as many decimals as required.

https://user-images.githubusercontent.com/102601367/205074103-e9f584d0-8262-406c-b45b-a9060a9aa32d.mov

- **Details**: gets the stablecoin details.
- **Balance**: gets the balance from an account.
- **Burn**: burns tokens from treasury account.

https://user-images.githubusercontent.com/102601367/205074150-4f35c38d-998b-423a-8378-2b795997c0cc.mov

- **Wipe**: burns tokens from an account.

https://user-images.githubusercontent.com/102601367/205074204-d7f0def7-ffbd-416a-8263-608a49c41708.mov

- **Rescue**: transfers tokens from the treasury account to a rescue account. This option is only available through the smart contract.

https://user-images.githubusercontent.com/102601367/205074235-32145a1b-4ce0-4913-bd18-1252ecff52d6.mov

- **Rescue HBAR**: transfers HBAR from the treasury account to a rescue account. This option is only available through the smart contract.

https://github.com/hashgraph/stablecoin-studio/assets/108128685/e09a9389-8f29-4869-a696-58b25d99a6f3

- **Freeze Management**: freezes/unfreezes an account for a token or checks if an account is frozen/unfrozen. If an account is frozen, it will not be able to transfer any tokens.

https://user-images.githubusercontent.com/114951681/228851899-8a63b255-8e97-4705-8765-f59c01fc928b.mp4

- **FeeS Management**: creats/removes custom fees for a token or lists existing ones. Fees are applied when the token is transferred.

https://github.com/hashgraph/stablecoin-studio/assets/108128685/a18f8723-d161-4283-a867-81d0d204e015

- **KYC Management**: grants/revokes KYC to/from an account or checks an account's kyc status. If an account is granted KYC, it can be involved in any token transfer.

https://user-images.githubusercontent.com/114951681/228851958-db534d9e-0bc3-41f5-9820-7ce79fcf643b.mp4

- **Role management**: administrators of a stablecoin can manage user roles from this menu, they will have the possibility to grant, revoke, edit (manage the supplier allowance) and check roles.

  - The available roles are:
    - CASHIN_ROLE
    - BURN_ROLE
    - WIPE_ROLE
    - RESCUE_ROLE
    - PAUSE_ROLE
    - FREEZE_ROLE
    - KYC_ROLE
    - DELETE_ROLE

- **Refresh roles**: automatically refreshes the roles assigned to the current account (account's capacities).
- **Configuration**: This last option allows the user to manage both the stablecoin configuration and the token configuration. 
Firstly, the stablecoin configuration allows the user to upgrade the stablecoin contract implementation and to change the stablecoin proxy admin contract owner. In the case of the token configuration, stablecoin administrators can edit the underlying token's properties such as "name", "symbol", "keys" ...
To change the onwership of the proxy amdmin contract, the current owner will have to invite another account id to be the next owner. In this moment, this current owner could cancel the change before the proposed owner can accept the invitation. Once the invited account accepts the invitation, the change is completed.
- **Danger Zone**: this section contains the stablecoin operations deemed as particularly "dangerous" either because they affect every single token owner (PAUSE) or because they can not be rolled-back (DELETE).
  For security reasons these operations are grouped in a "sub-menu" so that users do not run them by mistake.
  - **Un/Pause**: pauses and unpauses the token preventing it from being involved in any kind of operation.
  - **Delete**: marks a token as deleted. This actions cannot be undone.

#### List stablecoins

This option displays all the stablecoins the user has created or added.

#### Configuration

This last option allows the user to display the current configuration file, modify the configuration path, change the default network and manage:

- **Accounts**: Allows the user to change the current account, see all configured accounts and also add new accounts and remove existing ones.
- **Mirror nodes**: Allows the user to change the current mirror node, see all configured mirror nodes for the selected Hedera network, add new mirror nodes and remove existing ones except for the one that is being used.
- **JSON-RPC-Relay services**: Allows the user to change the current JSON-RPC-Relay service, see all configured services for the selected Hedera network, add new JSON-RPC-Relay servies and remove existing ones except for the one that is being used. You can check the available JSON-RPC relays [here](https://github.com/hashgraph/stablecoin-studio/blob/main/README.md#JSON-RPC-Relays)
- **Factory**: Allows the user to change the factory id of the selected Hedera network in the configuration file, to upgrade the factory's proxy, to change the factory's proxy admin owner account and, finally, to view de current factory implementation contract address as well as the factory owner account previously commented.

# Testing

## Jest

The project uses [Jest](https://jestjs.io/es-ES/) for testing.

## Run

Tests may be run using the following command

```shell
npm run test
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
