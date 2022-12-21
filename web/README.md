<div align="center">

# Hedera Stable Coin - Web

[![WEB - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml)

</div>

### Table of Contents
- **[Overview](#Overview)**<br>
- **[Build](#Build)**<br>
  - [Pre-requirements](#Pre-requirements)<br>
  - [Steps](#Steps)<br>
- **[Run](#Run)**<br>
  - [Start the app](#Start-the-app)<br>
  - [Select a wallet](#Select-a-wallet)<br>
  - [Switch wallets](#Switch-wallets)<br>
  - [Create stable coins](#Create-stable-coins)<br>
  - [Import stable coins](#Import-stable-coins)<br>
  - [Operate stable coins](#Operate-stable-coins)<br>
  - [Manage roles](#Manage-roles)<br>
- **[Test](#Test)**<br>
  - [Jest](#Jest)<br>
  - [Execute](#Execute)<br>
- **[Support](#Support)**<br>
- **[Contributing](#Contributing)**<br>
- **[Code of Conduct](#Code-of-Conduct)**<br>
- **[License](#License)**<br>

# Overview
The Web uses the API exposed by the SDK to create, manage and operate Stable Coins. It is meant as a "demo tool" to showcase the project's functionalities.
It is a user-friendly Front End application based on React for technical and non-technical people to use (as opposed to the CLI which is meant for more technical people).
The web is compatible with Hashpack and Metamask and although both wallets can be paired at the same time, only one will actually be "in scope" (used to sign the transactions). Users will be free to switch from one wallet to the other at any time they want.

# Build

## Pre-requirements
You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13` and `< v17`
- [npm](https://www.npmjs.com/)

You must have installed and built

1. [Contracts installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/sdk/README.md#installation)
3. [Hashconnect installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/hashconnect/lib/README.md#installation)

## Steps
From the root of the WEB project workspace:

1. Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
2. Run `npm start`. This will serve a web app and opens it in the browser.

# Run
To use the WEB correctly it is necessary to have installed Hashpack and/or Metamask plugin in the browser to interact with the app

## Start the app
```shell
npm run start
```

## Select a wallet
![Alt text](docs/images/init.png?raw=true 'selecting a wallet')

The front end will automatically detect how many compatible wallets are available and ask you to select one of them to operate with.

## Switch wallets
![Alt text](docs/images/disconnect.png?raw=true 'disconnect')

If you want to switch to another compatible wallet, you can do it at any time by clicking on the disconnect button (top right corner) then connecting again.

## Create stable coins
![Alt text](docs/images/create.png?raw=true 'create stable coin')

In order to create a new stable coin using the WEB, you must click on the "Create Coin" button at the top of the page then fill-in all the required information.
Once the stable coin is created it will be added to the drop-down list of coins you have access to (with the account you used to create the stable coin).

## Import stable coins
![Alt text](docs/images/import.png?raw=true 'import stable coin')

In order to import a stable coin using the WEB, you must click on the "Add coin" button at the top of the page (next to the create coin button) then fill-in all the required information. You can import any stable coin you want and it will be added to the drop-down list of coins you have access to.

> You will only be allowed to operate the imported stable coins based on the roles that your account has been granted. If you import a stable coin that your account does not have any role over, you will not be able to do anything with it.

## Operate stable coins
![Alt text](docs/images/Operations.png?raw=true 'Operations')

The operations linked to the capabilities (roles) assigned to your account for the selected stable coin will be available.

## Manage Roles
![Alt text](docs/images/RoleMgmgt.png?raw=true 'Roles management')

If your account has the stable coin admin role, you will also be allowed to manage the stable coin's roles.

# Test

## Jest
The project uses [Jest](https://jestjs.io/es-ES/) for testing.

## Execute
Tests may be run using the following command

```shell
npm run test
```

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
