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

The Wallets currently supported by the project are [Hashpack](https://www.hashpack.app/) and [Metamask](https://www.hashpack.app/)

> In order to use the WEB correctly it is necessary to have at least one of those two wallets already installed in your browser. You can nevertheless have both and switch from one to the other.

## Web Flow

### Create stable coins
![Alt text](docs/images/create.png?raw=true 'create stable coin')

In order to create a new stable coin using the WEB, you must click on the "Create Coin" button at the top of the page then fill-in all the required information.
Once the stable coin is created it will be added to the drop-down list of coins you have access to (with the account you used to create the stable coin).

### Import stable coins
![Alt text](docs/images/import.png?raw=true 'import stable coin')

In order to import a stable coin using the WEB, you must click on the "Add coin" button at the top of the page (next to the create coin button) then fill-in all the required information. You can import any stable coin you want and it will be added to the drop-down list of coins you have access to.

> You will only be allowed to operate the imported stable coins based on the roles that your account has been granted. If you import a stable coin that your account does not have any role over, you will not be able to do anything with it.

### Operate stable coins
![Alt text](docs/images/Operations.png?raw=true 'Operations')

The operations linked to the capabilities (roles) assigned to your account for the selected stable coin will be available.

### Manage Roles
![Alt text](docs/images/RoleMgmgt.png?raw=true 'Roles management')

If your account has the stable coin admin role, you will also be allowed to manage the stable coin's roles.

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
