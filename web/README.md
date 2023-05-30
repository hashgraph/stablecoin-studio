<div align="center">

# Hedera Stable Coin - Web

[![WEB - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml)

</div>

### Table of Contents
- **[Overview](#Overview)**<br>
- **[Installation](#Installation)**<br>
- **[Build](#Build)**<br>
- **[Quick Start](#Quick-Start)**<br>
  - [ENV vars](#ENV-vars)<br>
  - [Starting the UI](#Starting-the-UI)<br>
  - [Pairing a wallet](#Pairing-a-wallet)<br>
- **[Usage](#Usage)**<br>
  - [Supported Wallets](#Supported-Wallets)<br>
  - [Web Flow](#Web-Flow)<br>
- **[Testing](#Testing)**<br>
- **[Contributing](#Contributing)**<br>
- **[Code of Conduct](#Code-of-Conduct)**<br>
- **[License](#License)**<br>

# Overview

The Web uses the API exposed by the SDK to create, manage and operate stable coins. It is meant as a "demo tool" to showcase the project's functionalities.
It is a user-friendly Front End application based on React for technical and non-technical people to use (as opposed to the CLI which is meant for more technical people).
The web application is compatible with HashPack and MetaMask and although both wallets can be paired at the same time, only one will actually be "in scope" (used to sign the transactions). Users will be free to switch from one wallet to the other at any time they want.

# Installation

To install from NPM

```shell
npm install @hashgraph-dev/stablecoin-dapp
```

# Build

You will need the following supporting tools/frameworks installed

- [Node.js](https://nodejs.org/) `>= v16.13` and `< v17`
- [npm](https://www.npmjs.com/)

Then you have to install and build

1. [Contracts installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/sdk/README.md#installation)
3. [Hashconnect installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/hashconnect/lib/README.md#installation)

Finally, in order to build the project, go to the root of the WEB project workspace:

1. Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
2. Run `npm start`. This will serve a web app and opens it in the browser.

# Quick Start

## ENV vars

Copy the provided `.env.sample` to `.env` and edit as necessary.

The ENV file contains the following parameters:

- **REACT_APP_LOG_LEVEL**: defines the log level the application is going to apply to filter the logs been displayed in the browser's console. The default value is "ERROR".
- **REACT_APP_FACTORIES**: This var is required if you want to create a new stable coin. The var must be a JSON array with a factory id in Hedera format `0.0.XXXXX` per environment.
- **REACT_APP_MIRROR_NODE**: This var is required if you want to create a new stable coin. The var must be a unique mirror node service for Hedera network, and this is the service which would be used when the UI starts.
- **REACT_APP_RPC_NODE**: This var is required if you want to create a new stable coin. The var must be a unique rpc node service for Hedera network, and this is the service which would be used when the UI starts.
```
REACT_APP_FACTORIES='[{"Environment":"mainnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.1234567"},{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.3950554"},{"Environment":"previewnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.239703"}]'
REACT_APP_MIRROR_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.mirrornode.hedera.com/api/v1/", "API_KEY": "132456", "HEADER": "x-api-key"}]'
REACT_APP_RPC_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.hashio.io/api", "API_KEY": "132456", "HEADER": "x-api-key"}]'
```
If the env files does not exist or the factory var is not set when you click in "Create a new Stable coin" an alert will be shown.
![image](https://user-images.githubusercontent.com/114951681/229088627-369506c3-9c28-435c-9e44-d8908f8a15ab.png)
You can use our [deployed factories](https://github.com/hashgraph/hedera-accelerator-stablecoin#deploying-the-stable-coin-factories).
- **GENERATE_SOURCEMAP**: This is a proprietary Create React App configuration. You can read more information in its documentation.[Create React App documentation](https://create-react-app.dev/docs/advanced-configuration/)

## Starting the UI

```shell
npm run start
```

## Pairing a wallet

![Alt text](docs/images/init.png?raw=true 'selecting a wallet')

The front end will automatically detect how many compatible wallets are available and ask you to select one of them to operate with.

![image](https://user-images.githubusercontent.com/114951681/229089031-9f014228-68cf-4d94-b4da-448d16e884b3.png)

If you choose HashPack, you will be asked to choose a network (testnet or mainnet)

![Alt text](docs/images/disconnect.png?raw=true 'disconnect')

If you want to switch to another compatible wallet, you can do it at any time by clicking on the disconnect button (top right corner) then connecting again.

# Usage

## Supported Wallets

The Wallets currently supported by the project are [HashPack](https://www.hashpack.app/)(for [ED25519](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ed25519) accounts) and [MetaMask](https://metamask.io/)(for [ECDSA](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ecdsa-secp256k1_) accounts)

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

## Web Flow

### Create stable coins

In order to create a new stable coin using the web application, you must click on the "Create Coin" button at the top of the page then fill-in all the required information :

![Alt text](docs/images/create.png?raw=true 'create stable coin')

**Basic details**

Basic information about the Stable coin.

![image](https://user-images.githubusercontent.com/114951681/229089526-0aff1e72-3850-4adf-8a8d-0ce604c25752.png)


**Optional details**

Stable coin supply and accuracy definition (initial supply, max supply, decimals)

![image](https://user-images.githubusercontent.com/114951681/229089582-eca58c48-3315-4a8d-aa3a-cc71a99aacf1.png)


**Manage permissions**

Underlying token's keys definition (stable coin smart contract, current key, another key or no key at all), plus the possibility to grant KYC to the creating account at creation time (this option is only available if the KYC key is assigned to the smart contract and the Supply Key is not assigned to the creating account)

![image](https://user-images.githubusercontent.com/114951681/229089693-132bd8bd-4c4d-48dd-bae9-e58c13067f8c.png)


**Proof Of Reserve**

Choose if the stable coin will have a proof of reserve (PoR) associated to it or not.
If so, the user will have two options, either submit the address of an already existing PoR contract or generate a completely new one (using the demo implementation of a PoR contract included in the project) specifying an initial Reserve amount.

![image](https://user-images.githubusercontent.com/114951681/229089752-d0326884-7fa3-4126-85b2-2c82a7d4a05a.png)


**Review**

Final validation before creating the stable coin.

![image](https://user-images.githubusercontent.com/114951681/229089813-893aac1f-2443-4aee-872c-8ba0e7ac8834.png)


You will then have to validate the transaction using the wallet you paired to.

Once the stable coin is created it will be added to the drop-down list of coins you have access to (with the account you used to create the stable coin).

### Import stable coins

In order to import an existing stable coin using the web application, you must use the component to select the stable coin, introducing the token id, instead of selecting an existing one, and pushing into the "import stable coin" modal emerged when introducing the token id.

You can import any stable coin you want, and it will be added to the drop-down list of coins you have access to.

> You will only be allowed to operate the imported stable coins based on the roles that your account has been granted. If you import a stable coin that your account does not have any role over, you will not be able to do anything with it.

### Operate stable coins

![image](https://github.com/hashgraph/hedera-accelerator-stablecoin/assets/108128685/dc35e85a-5ae6-4bfc-ab77-d81c661be43a)

The operations linked to the capabilities (roles) assigned to your account for the selected stable coin will be available.

### Manage Roles

![image](https://user-images.githubusercontent.com/114951681/229090716-8aa224e6-4f05-42ed-9a74-01f519427b95.png)

If your account has the stable coin admin role, you will also be allowed to manage the stable coin's roles.

### Fees Management

![image](https://user-images.githubusercontent.com/114951681/229092960-dd67ccc7-d340-4bb9-a3ba-0f2e33e61d0f.png)

If your account has the stable coin fee role, you will also be allowed to manage the token's custom fees.

### Proof Of Reserve

![image](https://user-images.githubusercontent.com/110887433/213154467-70663bd0-2116-4121-9b3a-3028e4309fff.png)

If your stable coin is associated to a proof of reserve (PoR), you can update the PoR contract address at anytime from here.

> Warning: updating the PoR contract address can have a serious impact on your stable coin cash-in functionality since it will start referring to a completely different contract to check the Reserve. If for some reason the new contract's reserve is less than the previous one, you might not be able to mint any new tokens.

If (and only if) the PoR contract attached to your stable coin is the PoR demo implementation included in this project you will also have the possibility to change its reserve amount from here. You will only need to use the PoR admin account (the account used to deploy the stable coin).

> This is the main reason why the PoR demo implementation included in this project must be used only for demo purposes, the reserve amount can be changed at any time without any check or control whatsoever...

### Settings



This option allows the user to change the **HederaTokenManager** contract proxy admin owner and also to upgrade the stable coin implementation. So, as the **HederaTokenManager** uses a **TransparentUpgradeableProxy**, the owner of the proxy admin contract will be the only one who can change the implementation. This way, through this option the user could change the account who is able to upgrade the implementation and also could upgrade the implementation.


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

# Code of Conduct
This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License
[Apache License 2.0](../LICENSE)
