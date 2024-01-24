# Custodial Wallets Library

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

- [1. Overview](#1-overview)
- [2. Architecture](#2-architecture)
- [3. Technologies](#3-technologies)
- [4. How to use it](#4-how-to-use-it)
  - [4.1. Install](#41-install)
  - [4.2. Import](#42-import)
  - [4.3. Run](#43-run)
    - [4.3.1. Create Service](#431-create-service)
    - [4.3.2. Create Signature Request](#432-create-signature-request)
    - [4.3.3. Sign Transaction](#433-sign-transaction)
- [5. Build](#5-build)
- [6. Test](#6-test)
  - [6.1. Files](#61-files)
  - [6.2. Configuration](#62-configuration)
  - [6.3. Run](#63-run)
- [7. Contributing](#7-contributing)
- [8. Code of Conduct](#8-code-of-conduct)
- [9. License](#9-license)

## 1. Overview

The _custodialwalletutils_ library is a Typescript utility designed to simplify custodial wallet management. It provides developers with tools to abstract complex aspects of custodial wallets, allowing them to focus on their application's core logic.
Optimized for integration with the Hedera network, it supports services like Fireblocks and Dfns and is scalable for various wallet services. The library's code is organized in a clear directory structure, with source code and unit and integration tests in separate folders. It's developed in Typescript, optimized for Node.js, and managed through npm for easy dependency handling and testing. The library is user-friendly, emphasizing developer experience and code readability. It includes extensive unit tests, ensuring its reliability and stability for managing custodial wallets in Typescript applications.

#### Current services supported

- DFNS
- Fireblocks

## 2. Architecture

The `custodialwalletutils` library implements a factory-strategy pattern, enabling object creation without specifying their exact class. The library's structure is divided into two primary directories:

1. **src/**: This directory houses the core source code and is organized into subdirectories:

- **factories/**: Contains logic to return the correct strategy based on received configuration.
- **models/**: Hosts models for interacting with the library's exposed services, including the `SignatureRequest`.
- **services/**: Includes `CustodialWalletService`, which exposes the library's services.
- **strategies/**: Comprises configuration classes for the factory and individual strategy classes, each with specific strategy logic.
- **utils/**: Stores reusable logic utilized across different strategies.

2. **tests/**: Contains all unit tests for the utility functions and classes in the library. Each test file corresponds to a source file and includes tests for various functions and classes.

The strategy classes in the src/ directory, following a factory-strategy pattern, along with various helper functions and classes, facilitate the creation and management of custodial wallets, enhancing code readability and maintainability.

## 3. Technologies

- **TypeScript**: TypeScript is a typed superset of JavaScript that adds static types. It's used in this project for writing the source code.
- **npm**: npm is the package manager for Node.js and is used for managing dependencies and running scripts.
- **Jest**: Jest is a JavaScript testing framework used to write and run tests.
- **dfns-sdk**: This is the Dfns SDK. It's used for integrating with the Dfns platform.
- **fireblocks-sdk**: This is the Fireblocks SDK. It's used for integrating with the Fireblocks platform.
- **dotenv**: This is a zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## 4. How to use it

### 4.1. Install

To install the custodialwalletutils library, navigate to the root directory of the library and run the following command:

```sh
npm install
```

This command installs all the dependencies listed in the [`package.json`](package.json) file.

### 4.2. Import

To use a function or class from the custodialwalletutils library in your code, you first need to import it. Here's an example of how to import a function:

```typescript
const { functionName } = require('custodialwalletutils');
```

Replace `functionName` with the actual name of the function you want to use.

### 4.3. Run

In the custodial wallet management process, the CustodialWalletService class plays a central role. To create a service, instantiate the class with a relevant configuration, such as FireblocksConfig. This involves specifying essential parameters like API keys and account IDs. Following this, a signature request is created using the SignatureRequest class, defining the transaction bytes to be signed. The transaction signing is accomplished by calling the signTransaction method on the service instance. This streamlined approach provides a concise and effective way to manage custodial wallets in an application.

#### 4.3.1. Create Service

To create a service, you need to instantiate the `CustodialWalletService` class with the appropriate configuration. This can be either a `FireblocksConfig` or `DFNSConfig` instance, depending on the service you want to use.

Here's an example of how to create a service:

```javascript
import { CustodialWalletService, FireblocksConfig } from 'custodialwalletutils';

const config = new FireblocksConfig(
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_BASE_URL,
  FIREBLOCKS_VAULT_ACCOUNT_ID,
  FIREBLOCKS_ASSET_ID,
);

const service = new CustodialWalletService(config);
```

#### 4.3.2. Create Signature Request

To create a signature request, you need to instantiate the `SignatureRequest` class with the transaction bytes you want to sign.

Here's an example of how to create a signature request:

```javascript
import { SignatureRequest } from 'custodialwalletutils';

const transactionBytes = new Uint8Array([1, 2, 3]); // replace with your transaction bytes
const request = new SignatureRequest(transactionBytes);
```

#### 4.3.3. Sign Transaction

To sign a transaction, you need to call the `signTransaction` method on the service instance, passing in the signature request.

Here's an example of how to sign a transaction:

```javascript
const signature = await service.signTransaction(request);
```

This will return a `Uint8Array` containing the signature of the transaction.

## 5. Build

To compile TypeScript files into JavaScript. The command `tsc -p tsconfig.json` is typically run before deploying the application or testing the compiled JavaScript code.

Here's a breakdown of the command:

- `tsc`: This is the TypeScript compiler command. It's used to compile TypeScript (`.ts`) files into JavaScript (`.js`) files.

- `-p tsconfig.json`: The `-p` option tells the TypeScript compiler to use the configuration from the `tsconfig.json` file. This file contains settings for the TypeScript compiler, such as the target JavaScript version, the root directory of the source files, compiler options, and more.

When you run `npm run build` in your terminal, npm will execute this script command, which will compile your TypeScript code into JavaScript using the settings from your `tsconfig.json` file.

## 6. Test

### 6.1. Files

Test files for the `custodialwalletutils` library are in the `__tests__/` directory, corresponding to the source files in the `src/` directory. Key test files include:

- **StrategyFactory.test.ts**: Tests the `StrategyFactory` for both Fireblocks and DFNS configurations. Verifies if the factory correctly instantiates `FireblocksStrategy` with Fireblocks config, and `DFNSStrategy` with DFNS config, ensuring each strategy is appropriately created.

- **Model.test.ts**: Focuses on the `SignatureRequest` class, testing methods like `getTransactionBytes` and `setTransactionBytes` for handling transaction bytes.

- **Service.test.ts**: An integration test suite for the `CustodialWalletService` class. It assesses the class's ability to manage configurations and sign transactions. The suite features distinct test cases, focusing on configuration settings and the signing process, with special attention to the integration with Fireblocks and DFNS services.

- **DFNSStrategy.test.ts**: Tests the `DFNSStrategy` class, especially the `sign` method, using a mock DFNS API client for signature generation and verification.

- **FireblocksStrategy.test.ts**: Similar to DFNSStrategy tests, but focused on the `FireblocksStrategy` class, using a mock Fireblocks SDK for the signing process.

The tests, written using Jest in a Node.js environment, comprehensively cover signature strategies, transaction handling, and other functionalities of the library.

### 6.2 Configuration

The configuration for the tests is defined in the `jest.config.js` file located in the root directory of the library.
`config.ts`: configuration file for the `custodialwalletutils` tests. This file is responsible for setting up the configurations for the `FireblocksConfig` and `DFNSStrategy` classes, which are used to manage the interactions with the Fireblocks and DFNS APIs, respectively.

The `dotenv` package is used to load environment variables from a `.env` file. These environment variables are necessary for the tests to run.

```env
FIREBLOCKS_API_SECRET_KEY_PATH=Path to Fireblocks API secret key file
FIREBLOCKS_API_KEY=Your Fireblocks API key
FIREBLOCKS_BASE_URL=Base URL of Fireblocks API
FIREBLOCKS_ASSET_ID=Asset ID for Fireblocks
FIREBLOCKS_VAULT_ACCOUNT_ID=Vault account ID for Fireblocks

DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN=Authorization token for DFNS service account
DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID=Credential ID for DFNS service account
DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_PATH=Path to DFNS service account private key file
DFNS_APP_ORIGIN=URL origin of DFNS app
DFNS_APP_ID=ID of DFNS app
DFNS_TEST_URL=Test URL for DFNS API
DFNS_WALLET_ID=Wallet ID for DFNS
```

### 6.3. Run

To run the tests, navigate to the root directory of the custodialwalletutils library and run the following command:

```sh
npm run test
```

## 7. Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

## 8. Code of Conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

## 9. License

[Apache License 2.0](LICENSE)
