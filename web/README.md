<div align="center">

# Stablecoin Studio - Web

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](../LICENSE.md)

</div>

### Table of Contents

- **[Overview](#overview)**<br>
- **[Installation](#installation)**<br>
- **[Build](#build)**<br>
- **[Quick Start](#quick-start)**<br>
  - [ENV vars](#env-vars)<br>
  - [Starting the UI](#starting-the-ui)<br>
  - [Pairing a wallet](#pairing-a-wallet)<br>
- **[Usage](#usage)**<br>
  - [Supported Wallets](#supported-wallets)<br>
  - [Web Flow](#web-flow)<br>
- **[Testing](#testing)**<br>
- **[Contributing](#contributing)**<br>
- **[Code of Conduct](#code-of-conduct)**<br>
- **[License](#license)**<br>

# Overview

The Web uses the API exposed by the SDK to create, manage and operate stablecoins. It is meant as a "demo tool" to showcase the project's functionalities.
It is a user-friendly Front End application based on React for technical and non-technical people to use (as opposed to the CLI which is meant for more technical people).
The web application is compatible with Blade, HashPack and MetaMask and although all wallets can be paired at the same time, only one will actually be "in scope" (used to sign the transactions). Users will be free to switch from one wallet to the other at any time they want.

# Installation

To install from NPM

```shell
npm install @hashgraph/stablecoin-dapp
```

# Build

You will need the following supporting tools/frameworks installed

- [Node.js](https://nodejs.org/) `>= v16.13`
- [npm](https://www.npmjs.com/)

Then you have to install and build

1. [Contracts installation](https://github.com/hashgraph/stablecoin-studio/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md#installation)

Finally, in order to build the project, go to the root of the WEB project workspace:

1. Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
2. Run `npm start`. This will serve a web app and opens it in the browser.

# Quick Start

## ENV vars

Copy the provided `.env.sample` to `.env` and edit as necessary.

The ENV file contains the following parameters:

- **REACT_APP_LOG_LEVEL**: defines the log level the application is going to apply to filter the logs been displayed in the browser's console. The default value is "ERROR".
- **REACT_APP_FACTORIES**: This var is only required if you want to create a new stablecoin. The var must be a JSON array with a factory proxy id in Hedera format `0.0.XXXXX` per environment. Regarding this, your can find the factories proxy's contract ids depending on the Stablecoin Studio versión [here](./../FACTORY_VERSION.md).
- **REACT_APP_RESOLVERS**: This var is only required if you want to create a new stablecoin. The var must be a JSON array with a business logic resolver proxy id in Hedera format `0.0.XXXXX` per environment. Regarding this, your can find the business logic resolver proxy's contract ids depending on the Stablecoin Studio versión [here](./../RESOLVER_VERSION.md).
- **REACT_APP_MIRROR_NODE**: This var is required if you want to create a new stablecoin. The var must be a unique mirror node service for each Hedera network, and this is the service which would be used when the UI starts. The service is configured by the environment and the base url properties, and, optionally, can also have an api key and a http header through which the api key is provided.
- **REACT_APP_RPC_NODE**: This var is required if you want to create a new stablecoin. The var must be a unique rpc node service for Hedera network, and this is the service which would be used when the UI starts. The service is configured using the same properties than the mirror node. You can check the available JSON-RPC relays [here](https://github.com/hashgraph/stablecoin-studio/blob/main/README.md#JSON-RPC-Relays).
- **REACT_APP_BACKEND_URL**: This variable is only required if you want to enable multisignature functionality. It corresponds to the backend REST API endpoint.
  > **Important:** If **REACT_APP_BACKEND_URL** is not set, the multisignature option will not be activated and therefore will not be displayed on the web interface.
- **REACT_APP_CONSENSUS_NODES**: This var is only required if you want to enable multisignature functionality. It is a list of consensus nodes per environment. When generating a multisignature transaction the first consensus node of the environment will be added to the transaction.
- **REACT_APP_ICON**: url of the application icon to be displayed on wallets when connecting.

```bash
REACT_APP_FACTORIES='[{"Environment":"mainnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.1234567"},{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.6176922"},{"Environment":"previewnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.239703"}]'
REACT_APP_RESOLVERS='[{"Environment":"mainnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.1234567"}, {"Environment":"testnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.6176887"},{"Environment":"previewnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.2345678"}]'
REACT_APP_MIRROR_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.mirrornode.hedera.com/api/v1/", "API_KEY": "132456", "HEADER": "x-api-key"}]'
REACT_APP_RPC_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.hashio.io/api", "API_KEY": "132456", "HEADER": "x-api-key"}]'
REACT_APP_BACKEND_URL='http://localhost:3001/api/'
REACT_APP_CONSENSUS_NODES='[{"Environment":"testnet","CONSENSUS_NODES":[{"ID":"0.0.3","ADDRESS":"34.94.106.61:50211"}]}]'
```

If the env files does not exist or the factory var is not set when you click in "Create a new stablecoin" an alert will be shown.
![image](https://user-images.githubusercontent.com/114951681/229088627-369506c3-9c28-435c-9e44-d8908f8a15ab.png)
You can use our [deployed factories](https://github.com/hashgraph/stablecoin-studio/blob/main/README.md#deploying-the-stablecoin-factories).

- **GENERATE_SOURCEMAP**: This is a proprietary Create React App configuration. You can read more information in its documentation. [Create React App documentation](https://create-react-app.dev/docs/advanced-configuration/)

For example, the following is a full working .env file that uses the Hedera mirror node service, the Hashio implementation of the JSON-RPC relay and the current factory.

```.env
REACT_APP_LOG_LEVEL=ERROR
REACT_APP_FACTORIES='[{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.6349500"}]'
REACT_APP_RESOLVERS='[{"Environment":"testnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.6349477"}]'
REACT_APP_MIRROR_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.mirrornode.hedera.com/api/v1/", "API_KEY": "", "HEADER": ""}]'
REACT_APP_RPC_NODE='[{"Environment":"testnet","BASE_URL":"http://localhost:7546/api", "API_KEY": "", "HEADER": ""}]'
REACT_APP_BACKEND_URL='http://localhost:3001/api/'
REACT_APP_CONSENSUS_NODES='[{"Environment":"testnet","CONSENSUS_NODES":[{"ID":"0.0.3","ADDRESS":"34.94.106.61:50211"}]}]'
GENERATE_SOURCEMAP=false
```

## Starting the UI

```shell
npm run start
```

## Pairing a wallet

![Alt text](docs/images/wallets.png?raw=true 'selecting a wallet')

The front end will automatically detect how many compatible wallets are available and ask you to select one of them to operate with.

![image](https://user-images.githubusercontent.com/114951681/229089031-9f014228-68cf-4d94-b4da-448d16e884b3.png)

If you choose HashPack or Blade, you will be asked to choose a network (testnet or mainnet)

If you want to switch to another compatible wallet, you can do it at any time by clicking on the disconnect button (top right corner) then connecting again.

If you choose Multisig, you will be asked to choose a network (testnet or mainnet) and enter the multisig account id

# Usage

## Supported wallets

The Wallets currently supported by the project are [HashPack](https://www.hashpack.app/)(for [ED25519](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ed25519) accounts), [Blade](https://bladewallet.io/) and [MetaMask](https://metamask.io/)(for [ECDSA](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ecdsa-secp256k1_) accounts)

### MetaMask configuration

In order to use MetaMask you must first configure it to interact with a Hedera relay [JSON-RPC relay node](https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay) because Hedera consensus nodes are not JSON-RPC compatible.

Add a new network with the following information :

- **Network Name**: HederaTestNet _(or any other name you wish)_
- **RPC URL**: https://testnet.hashio.io/api _(or the url of any other Hedera JSON-RPC relay node)_
- **Chain ID**: 296
- **Currency symbol**: HBAR
- **Block explorer URL**: https://hashscan.io/testnet/ _(or any other Hedera compatible block explorer you want)_

![image](https://user-images.githubusercontent.com/114951681/210327135-a88604ab-2d9c-4341-87fd-e84c4115364f.png)

You can switch from one network to another, or from one account to another using MetaMask, however not every account exists in every network and not every network belongs to Hedera, which is why you can potentially see the following warning messages:

![image](https://user-images.githubusercontent.com/114951681/229093620-b93f3ab4-f391-4d5e-a757-f85cbfcc0819.png)

If you select a non-Hedera network.

![image](https://user-images.githubusercontent.com/114951681/229093838-a6fc418f-a892-4863-a3c5-d4350eadd77f.png)

If you select an account that does not exist in the Hedera network.

> In order to use the web application correctly it is necessary to have at least one of those two wallets already installed in your browser. You can nevertheless have both and switch from one to the other.

## Web flow

### Create stablecoins

In order to create a new stablecoin using the web application, you must click on the "Create Coin" button at the top of the page then fill-in all the required information :

![Create stablecoin](docs/images/create.png?raw=true 'Create stablecoin')

**Basic details**

Basic information about the stablecoin. You can choose the name and the symbol of the stable coin and the config id (0x0000000000000000000000000000000000000000000000000000000000000002 by default) and version (1 by default).

![Create stablecoin details](docs/images/create_stable_coin_details.png?raw=true 'Create stablecoin details')

**Optional details**

Stablecoin supply and accuracy definition (initial supply, max supply, decimals)

![Create stablecoin details and metadata](docs/images/create_stable_coin_supply.png?raw=true 'Create stablecoin supply and metadata')

**Manage permissions**

Underlying token's keys definition (stablecoin smart contract, current key, another key or no key at all), plus the possibility to grant KYC to the creating account at creation time (this option is only available if the KYC key is assigned to the smart contract and the Supply Key is not assigned to the creating account).

In this step, the user can also configure the stablecoin proxy admin owner. By default, this ownership belongs to the account creating the stablecoin, but the user has the chance to change this default behaviour by configuring another account id, which can belongs to a contract, like a timelock controller, a cold wallet, or whatever account.

![Create stablecoin configure permissions](docs/images/create_stable_coin_permissions.png?raw=true 'Create stablecoin configure permissions')

**Proof of reserve**

Choose if the stablecoin will have a proof of reserve (PoR) associated to it or not.
If so, the user will have two options, either submit the address of an already existing PoR contract or generate a completely new one (using the demo implementation of a PoR contract included in the project) specifying an initial Reserve amount. The config id (0x0000000000000000000000000000000000000000000000000000000000000003 by default) and the config version (1 by default)

![Create stablecoin proof of reserve](docs/images/create_stable_coin_reserve.png?raw=true 'Create stablecoin proof of reserve')

**Review**

Final validation before creating the stablecoin.

![Create stablecoin review](docs/images/create_stable_coin_create.png?raw=true 'Create stablecoin review')

You will then have to validate the transaction using the wallet you paired to.

Once the stablecoin is created it will be added to the drop-down list of coins you have access to (with the account you used to create the stablecoin).

### Import stablecoins

In order to import an existing stablecoin using the web application, you must use the component to select the stablecoin, introducing the token id, instead of selecting an existing one, and pushing into the "import stablecoin" modal emerged when introducing the token id.

You can import any stablecoin you want, and it will be added to the drop-down list of coins you have access to.

> You will only be allowed to operate the imported stablecoins based on the roles that your account has been granted. If you import a stablecoin that your account does not have any role over, you will not be able to do anything with it.

### Operate stablecoins

![Selection_015](https://github.com/hashgraph/stablecoin-studio/assets/108128685/b9a74668-03bd-4d59-b8f1-3d1234a1e065)

The operations linked to the capabilities (roles) assigned to your account for the selected stablecoin will be available.

### Manage roles

![Selection_035](https://github.com/hashgraph/stablecoin-studio/assets/108128685/4f48bb78-110d-426e-935f-e520ab506208)

If your account has the stablecoin admin role, you will also be allowed to manage the stablecoin's roles.

### Stablecoin details

![Selection_031](https://github.com/hashgraph/stablecoin-studio/assets/108128685/bbc2deb4-aaa1-4294-a811-e9f2ec785759)

This menú option displays stablecoin details and also allows the user to update some of the token properties, like the name, the symbol, the keys..., clicking on the the pencil icon located at the top right side of the screen, which transforms the information page into a form where this properties can be modified by the user.

### Fees management

![image](https://user-images.githubusercontent.com/114951681/229092960-dd67ccc7-d340-4bb9-a3ba-0f2e33e61d0f.png)

If your account has the stablecoin fee role, you will also be allowed to manage the token's custom fees.

This menu option will only be visible when using Hashpack or Blade, and will soon be available when using Metamask as well.

### Proof of reserve

![image](https://user-images.githubusercontent.com/110887433/213154467-70663bd0-2116-4121-9b3a-3028e4309fff.png)

If your stablecoin is associated to a proof of reserve (PoR), you can update the PoR contract address at anytime from here.

> Warning: updating the PoR contract address can have a serious impact on your stablecoin cash-in functionality since it will start referring to a completely different contract to check the Reserve. If for some reason the new contract's reserve is less than the previous one, you might not be able to mint any new tokens.

If (and only if) the PoR contract attached to your stablecoin is the PoR demo implementation included in this project you will also have the possibility to change its reserve amount from here. You will only need to use the PoR admin account (the account used to deploy the stablecoin).

> This is the main reason why the PoR demo implementation included in this project must be used only for demo purposes, the reserve amount can be changed at any time without any check or control whatsoever...

### Settings

This option allows the user to manage the stablecoin business logic resolver contract. These contracts are both upgradeable, using an implementation of the OpenZeppelin **TransparentUpgradeableProxy** contract. This proxy can only be managed by an administrator contract. Therefore, only the account which is the owner of the proxy's administrator contract will be able to manage the proxy, and this management allows the user to change the resolver contract.

![Settings](docs/images/settings.png?raw=true 'Settings')

If the user selects the option to manage the stablecoin, it could change the **Business Logic Resolver Proxy** contract, the config id and the config version.

![Settings update](docs/images/settings_update.png?raw=true 'Settings update')

### Multisig transactions

This tab will list all the pending transactions currently in the backend that :

- If you are connected with a wallet (Hashpack, Blade, Metamask): your current private key can sign.
- If you are connected with a multisig account: are associated to your account id.

For each displayed transactions you will have one or many options, also depending on your connection mode and the current status of the transaction:

- If you are connected with a **wallet** (Hashpack, Blade, Metamask):
  - If the transaction has not been fully signed yet:
    - If you have not signed it yet: **SIGN, REMOVE.**
    - If you have signed it already: **REMOVE.**
  - If the transaction has been fully signed already: **SEND(\*), REMOVE.**
    > (\*)SEND is not available if you are connected with Metamask
- If you are connected with a **multisig account**:
  - If the transaction has not been fully signed yet: **REMOVE.**
  - If the transaction has been fully signed already: **SEND, REMOVE.**

The operations that you can perform on a transaction are:

- **SIGN**: Signs the transaction using the private key associated to your wallet.
- **SEND**: Submits the transaction to the Hedera DLT.
- **REMOVE**: Removes the transaction from the backend, the transaction will be "discarded".

![Alt text](docs/images/MultisigTransactions.png?raw=true)

In order to view the **DETAILS** of a transaction you can click on its **DESCRIPTION**

![Alt text](docs/images/MultisigTransactionDetails.png?raw=true)

# Testing

The project uses [Jest](https://jestjs.io/es-ES/) for testing.

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

[Apache License 2.0](../LICENSE)
