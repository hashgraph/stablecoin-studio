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
The Web uses the API exposed by the SDK to create, manage and operate Stable Coins. It is meant as a "demo tool" to showcase the project's functionalities.
It is a user-friendly Front End application based on React for technical and non-technical people to use (as opposed to the CLI which is meant for more technical people).
The web is compatible with Hashpack and Metamask and although both wallets can be paired at the same time, only one will actually be "in scope" (used to sign the transactions). Users will be free to switch from one wallet to the other at any time they want.

# Installation

```shell
npm install @hashgraph/stablecoin-dapp
```

# Build

You must have pre-installed

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

The ENV file contains the following parameters:

- **REACT_APP_LOG_LEVEL**: defines the log level the application is going to apply to filter the logs been displayed in the browser's console. The default value is "TRACE".
- **REACT_APP_STABLE_COIN_FACTORY_ADDRESS**: This var is required if you want to create a new stablecoin. The var must be in Hedera format `0.0.XXXXX`.
If the env var is not setted when you click in "Create a new Stablecoin" will show an alert.
![Alt text](docs/images/alertNoEnv.png?raw=true 'alert when no env vars have been setted')
You can use our [factories deployed](https://github.com/hashgraph/hedera-accelerator-stablecoin#deploying-the-stable-coin-factories).
- **GENERATE_SOURCEMAP**: This is a proprietary Create React App configuration.You can read more information in its documentation.[Create React App documentation](https://create-react-app.dev/docs/advanced-configuration/)

## Starting the UI

```shell
npm run start
```

## Pairing a wallet

![Alt text](docs/images/init.png?raw=true 'selecting a wallet')

The front end will automatically detect how many compatible wallets are available and ask you to select one of them to operate with.

![Alt text](docs/images/disconnect.png?raw=true 'disconnect')

If you want to switch to another compatible wallet, you can do it at any time by clicking on the disconnect button (top right corner) then connecting again.

# Usage

## Supported Wallets

The Wallets currently supported by the project are [Hashpack](https://www.hashpack.app/)(for [ED25519](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ed25519) accounts) and [Metamask](https://metamask.io/)(for [ECDSA](https://docs.hedera.com/hedera/docs/sdks/keys/generate-a-new-key-pair#ecdsa-secp256k1_) accounts)

### Metamask configuration

In order to use metamask you must first configure it to interact with an Hedera [JSON-RPC relay node](https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay) because Hedera consensus nodes are not JSON-RPC compatible.

Add a new network with the following information : 
- **Network Name**: HederaTestNet _(or any other name you wish)_
- **RPC URL**: https://testnet.hashio.io/api _(or the url of any other Hedera JSON-RPC relay node)_
- **Chain ID**: 296
- **Currency symbol**: HBAR
- **Block explorer URL**: https://hashscan.io/testnet/ _(or any other hedera compatible block explorer you want)_

![image](https://user-images.githubusercontent.com/114951681/210327135-a88604ab-2d9c-4341-87fd-e84c4115364f.png)


> In order to use the WEB correctly it is necessary to have at least one of those two wallets already installed in your browser. You can nevertheless have both and switch from one to the other.

## Web Flow

### Create stable coins

In order to create a new stable coin using the WEB, you must click on the "Create Coin" button at the top of the page then fill-in all the required information :

![Alt text](docs/images/create.png?raw=true 'create stable coin')

**Basic details**

Basic information about the Stable coin.

![image](https://user-images.githubusercontent.com/110089113/212881844-776a06b8-ba65-4722-992b-ef1b7529e4e6.png)

**Optional details**

Stable coin supply and accuracy definition (inital supply, max supply, decimals)

![image](https://user-images.githubusercontent.com/110089113/212881920-45aed35b-4c82-4b01-bbb3-a6699a2dfa8b.png)

**Manage permissions**

Underlying token's keys definition (stable coin smart contract or another account), plus the possibility to grant KYC to the creating account at creation time (this option is only available if the KYC key is assigned to the smart contract and the Supply Key is not assigned to the creating account)

![image](https://user-images.githubusercontent.com/114951681/216949188-1a0db0e7-f3bd-41ef-8de2-1fec06cbb36d.png)

**Proof Of Reserve**

Choose if the stable coin will have a proof of reserve (PoR) associated to it or not.
If so, the user will have two options, either submit the address of an already existing PoR contract or generate a completely new one (using the demo implementation of a PoR contract included in the project) specifying an initial Reserve amount.

For more information about proof of reserve, see the [docs](https://github.com/hashgraph/hedera-accelerator-stablecoin/tree/feature/sdk/Chainlink_PoR#Proof-of-reserve).

![image](https://user-images.githubusercontent.com/110089113/212882109-7975a305-7bfa-450e-973a-625b5d528e5e.png)

**Review**

Final validation before creating the stable coin.

![image](https://user-images.githubusercontent.com/110089113/212882395-b7cd1366-9c67-4db3-8532-557d4f0ff3a2.png)

You will then have to validate the transaction using the wallet you paired to.

Once the stable coin is created it will be added to the drop-down list of coins you have access to (with the account you used to create the stable coin).

### Import stable coins

In order to import a stable coin using the WEB, you must click on the "Add coin" button at the top of the page (next to the create coin button) 

![Alt text](docs/images/import.png?raw=true 'import stable coin')

then fill-in all the required information. You can import any stable coin you want and it will be added to the drop-down list of coins you have access to.

![image](https://user-images.githubusercontent.com/114951681/210238673-895d1bbc-fce1-483d-af1d-6f45e522401d.png)

> You will only be allowed to operate the imported stable coins based on the roles that your account has been granted. If you import a stable coin that your account does not have any role over, you will not be able to do anything with it.

### Operate stable coins

![Alt text](docs/images/Operations.png?raw=true 'Operations')

The operations linked to the capabilities (roles) assigned to your account for the selected stable coin will be available.

### Manage Roles

![Alt text](docs/images/RoleMgmgt.png?raw=true 'Roles management')

If your account has the stable coin admin role, you will also be allowed to manage the stable coin's roles.

### Proof Of Reserve

![image](https://user-images.githubusercontent.com/110887433/213154467-70663bd0-2116-4121-9b3a-3028e4309fff.png)

If your stable coin is associated to a proof of reserve (PoR), you can update the PoR contract address at anytime from here.

> Warning: updating the PoR contract address can have a serious impact on your stable coin cash-in functionality since it will start refering to a completely different contract to check the Reserve. If for some reason the new contract's Reserve is less than the previous one, you might not be able to mint any new tokens.

If (and only if) the PoR contract attached to your stable coin is the PoR demo implementation included in this project you will also have the possibility to change its Reserve amount from here. You will only need to use the PoR admin account (the account used to deploy the stable coin).

> This is the main reason why the PoR demo implementation included in this project must be used only for demo purposes, the Reseve amount can be changed at any time without any check or control whatsoever...


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
[Apache License 2.0](LICENSE)
