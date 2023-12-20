# Custodial Wallets Library

- [1. Overview](#1-overview)
- [2. Architecture](#2-architecture)
- [3. Content](#3-content)
- [4. Technologies](#4-technologies)
- [5. How to use it](#5-how-to-use-it)
  - [5.1. Install](#51-install)
  - [5.2. Import](#52-import)
  - [5.3. Run](#53-run)
- [6. Build](#6-build)
- [7. Test](#7-test)
  - [7.1. Files](#71-files)
  - [7.2. Configuration](#72-configuration)
  - [7.3. Run](#73-run)
- [8. Contributing](#8-contributing)
- [9. Code of Conduct](#9-code-of-conduct)
- [10. License](#10-license)

## 1. Overview

The _custodialwalletutils_ library is a dedicated Typescript utility library crafted to streamline the intricacies of custodial wallet management. Its purpose is to furnish developers with a collection of functions and classes that abstract the complexities associated with custodial wallets. By doing so, developers can channel their efforts towards refining the core logic of their applications. While the library is tailored for seamless integration with the Hedera network and related software solutions, it is designed with scalability in mind, ensuring adaptability for a wide array of custodial wallet services.

Presently, the library supports custodial wallet services such as Fireblocks and Dfns, with a commitment to facilitating easy integration for additional services in the future.

The library's organizational structure is rooted in a well-defined directory layout, with the source code housed in the src/ directory and unit tests residing in the tests/ directory. Within the source code, a diverse array of utility functions and classes has been meticulously crafted, each serving a specific role in custodial wallet management.

Developed using modern Typescript and optimized for the Node.js runtime environment, the custodialwalletutils library is orchestrated through npm. This package manager streamlines tasks such as handling dependencies, building the library, and executing tests.

Utilizing the library involves a straightforward process: developers can install it via npm, import the necessary functions or classes into their code, and seamlessly integrate them as needed. The library prioritizes ease of use, emphasizing a positive developer experience and fostering code readability.

Complementing its array of utility functions and classes, the custodialwalletutils library includes a robust suite of unit tests. These tests play a pivotal role in guaranteeing the reliability and stability of the library, solidifying its standing as a dependable choice for managing custodial wallets within Typescript applications.

## 2. Architecture

The custodialwalletutils library follows a factory pattern, which allows for the creation of objects without specifying the exact class of the object that will be created. This design pattern is particularly useful when the object setup process is complex or when the program needs to create different types of objects that share a common super class.

The library is structured into two main directories:

- `src/`: this is where the source code of the custodialwalletutils library resides. This directory contains all the utility functions and classes that are part of the library. The main components of the library are the factory classes. These classes follow the factory pattern, which allows for the creation of objects without specifying the exact class of the object that will be created. This is particularly useful when the object setup process is complex or when the program needs to create different types of objects that share a common super class.

  Each factory class is responsible for creating instances of the different types of custodial wallets. They encapsulate the logic needed to create a specific type of custodial wallet, abstracting this complexity away from the client code. This makes it easier for developers to create and manage custodial wallets without having to understand the underlying details. In addition to the factory classes, the `src/` directory also contains various helper functions and classes. These are used by the factory classes to perform specific tasks related to the creation and management of custodial wallets. They further simplify the code and improve its readability and maintainability.

  The `src/` directory is an essential part of the library. It contains the core functionality of the library and is where most of the development work takes place.

- `tests/`: The `tests/` directory is a crucial part of the custodialwalletutils library. It contains all the unit tests for the utility functions and classes that are part of the library.

  Unit tests are small, isolated tests that check the correctness of a single function or class. They are an essential part of any software project, as they help to ensure that each part of the codebase works as expected. They can also help to catch and prevent bugs from being introduced into the codebase. In the context of the custodialwalletutils library, the unit tests in the `tests/` directory are designed to test the functionality of the utility functions and classes in the `src/` directory. Each test file typically corresponds to a single source file and contains multiple tests for the different functions or classes in that file.

  The tests are written using a testing framework, which provides a set of tools and functions for defining and running tests. The tests themselves are written in JavaScript and are designed to be run in the Node.js environment. When a test is run, it will call the function or class being tested with a set of predefined inputs and then check that the output is as expected. If the output matches the expected result, the test passes. If not, the test fails, indicating that there is a problem with the code.

  The `tests/` directory is an essential part of the development process. Before any changes are made to the codebase, the tests should be run to ensure that the existing code is working correctly. After changes are made, the tests should be run again to ensure that the changes have not introduced any new bugs. If new functionality is added to the codebase, new tests should be written to test this functionality.

In addition to ensuring the correctness of the code, the tests also serve as a form of documentation. They provide examples of how the functions and classes should be used and what their expected behavior is. This can be very helpful for developers who are new to the codebase or who are working on complex features.

The custodialwalletutils library is designed to be easy to use, with a focus on developer experience and code readability. It provides a robust suite of utility functions and classes, making it a dependable choice for managing custodial wallets in JavaScript applications.

## 3. Content

## 4. Technologies

- **JavaScript (Node.js)**: The library is written in JavaScript and is designed to run in a Node.js environment.
- **TypeScript**: TypeScript is a typed superset of JavaScript that adds static types. It's used in this project for writing the source code.
- **npm**: npm is the package manager for Node.js and is used for managing dependencies and running scripts.
- **Jest**: Jest is a JavaScript testing framework used to write and run tests.
- **ESLint**: ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- **Prettier**: Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules.
- **rimraf**: rimraf is a deep deletion module for node (like `rm -rf`).
- **@hashgraph/sdk**: This is the Hedera Hashgraph SDK for JavaScript. It's used for interacting with the Hedera Hashgraph network.
- **dfns-sdk**: This is the Dfns SDK. It's used for integrating with the Dfns platform.
- **fireblocks-sdk**: This is the Fireblocks SDK. It's used for integrating with the Fireblocks platform.
- **dotenv**: This is a zero-dependency module that loads environment variables from a `.env` file into `process.env`.
- **ethers**: This is a complete Ethereum wallet implementation and utilities in JavaScript and TypeScript.

## 5. How to use it

### 5.1. Install

To install the custodialwalletutils library, navigate to the root directory of the library and run the following command:

```sh
npm install
```

This command installs all the dependencies listed in the [`package.json`](package.json) file.

### 5.2. Import

To use a function or class from the custodialwalletutils library in your code, you first need to import it. Here's an example of how to import a function:

```typescript
const { functionName } = require('custodialwalletutils');
```

Replace `functionName` with the actual name of the function you want to use.

### 5.3. Run

To run a function from the custodialwalletutils library, call it in your code like this:

```typescript
functionName(arguments);
```

Replace `functionName` with the name of the function you want to run, and `arguments` with the arguments you want to pass to the function.

## 6. Build

## 7. Test

### 7.1. Files

The test files for the custodialwalletutils library are located in the `__tests__/` directory. Each test file typically corresponds to a single source file from the `src/` directory and contains multiple tests for the different functions or classes in that file.

The `__tests__/` directory contains the following test files:

- `StrategyFactory.test.ts`: test file for the `StrategyFactory` class in the `custodialwalletutils` library. This test file is written in TypeScript and uses the Jest testing framework. The `StrategyFactory` class is part of the factory pattern implemented in the library. The factory pattern is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created. In this case, the `StrategyFactory` class provides a method for creating instances of different signature strategy classes.

  The `createSignatureStrategy` method of the `StrategyFactory` class takes a `strategyConfig` object as an argument and calls the `getSignatureStrategy` method on this object. The `getSignatureStrategy` method is expected to return an instance of a class that implements the `ISignatureStrategy` interface.

  The test file contains two test cases, one for each of the `FireblocksStrategy` and `DFNSStrategy` classes. Each test case creates a new signature strategy using the `createSignatureStrategy` method of the `StrategyFactory` class and checks that the returned object is an instance of the expected class.

  The `FireblocksStrategy` and `DFNSStrategy` classes are part of the strategy pattern implemented in the library. They provide methods for signing transactions using the Fireblocks and DFNS APIs, respectively.

  The `dfnsConfig` and `fireblocksConfig` objects are mock configuration objects that are passed to the `createSignatureStrategy` method in the test cases. They are expected to have a `getSignatureStrategy` method that returns an instance of the `DFNSStrategy` or `FireblocksStrategy` class, respectively.

  The `TEST_TIMEOUT` constant is used to set a timeout for the test cases. This can be useful to prevent tests from running indefinitely if there is an issue with the code.

- `DFNSStrategy.test.ts`: This file contains tests for the `DFNSStrategy` class in the `src/` directory. It verifies the correct functionality of the `sign` method and other operations related to the DFNSStrategy.

  The test file begins with some mock setup for the DFNS API client. It uses `jest.mock` to create a mock implementation of the DFNS API client, which is used by the `DFNSStrategy` class. The mock implementation returns a predefined signature response when the `generateSignature` and `getSignature` methods are called.

  The `describe` block contains the tests for the `DFNSStrategy` class. Before each test, a new instance of `DFNSStrategy` is created using the `setupDfnsStrategy` function. This function creates a mock configuration object and passes it to the constructor of `DFNSStrategy`.

  The test case `should correctly sign a signature request` verifies that the `sign` method of `DFNSStrategy` correctly signs a given `SignatureRequest`. It creates a mock `SignatureRequest`, calls the `sign` method with this request, and then checks that the returned signature matches the expected signature. It also checks that the `generateSignature` and `getSignature` methods of the DFNS API client are called the correct number of times.

  The `SignatureRequest` class is a simple data class that holds the bytes of a transaction to be signed. The `DFNSConfig` class holds the configuration for the `DFNSStrategy` class, and the `DFNSStrategy` class implements the `ISignatureStrategy` interface and provides the method for signing transactions using the DFNS API.

  The `sign` method of `DFNSStrategy` takes a `SignatureRequest`, converts the transaction bytes to a hex string, signs this string using the DFNS API, and then converts the signature from a hex string to a `Uint8Array`.

- `FireblocksStrategy.test.ts`: This file contains tests for the `FireblocksStrategy` class. It checks the correct functionality of the `sign` method and other operations related to the FireblocksStrategy.

  The test file begins with some mock setup for the Fireblocks SDK. It uses `jest.mock` to create a mock implementation of the Fireblocks SDK, which is used by the `FireblocksStrategy` class. The mock implementation returns a predefined signature response when the `createTransaction` and `getTransactionById` methods are called.

  The `describe` block contains the tests for the `FireblocksStrategy` class. Before each test, a new instance of `FireblocksStrategy` is created using the `setupFireblocksStrategy` function. This function creates a mock configuration object and passes it to the constructor of `FireblocksStrategy`.

  The test case `should correctly sign a signature request` verifies that the `sign` method of `FireblocksStrategy` correctly signs a given `SignatureRequest`. It creates a mock `SignatureRequest`, calls the `sign` method with this request, and then checks that the returned signature matches the expected signature. It also checks that the `createTransaction` and `getTransactionById` methods of the Fireblocks SDK are called the correct number of times.

  The `SignatureRequest` class is a simple data class that holds the bytes of a transaction to be signed. The `FireblocksConfig` class holds the configuration for the `FireblocksStrategy` class, and the `FireblocksStrategy` class implements the `ISignatureStrategy` interface and provides the method for signing transactions using the Fireblocks API.

  The `sign` method of `FireblocksStrategy` takes a `SignatureRequest`, converts the transaction bytes to a hex string, signs this string using the Fireblocks API, and then converts the signature from a hex string to a `Uint8Array`.

- jjjjj

Each test file contains multiple tests for the different methods in the corresponding class from the `src/` directory. The tests are written using the Jest testing framework and are designed to be run in the Node.js environment.

Please note that this is a basic guide and might need to be adjusted based on the actual implementation of your custodialwalletutils library and its dependencies.

### 7.2. Configuration

The configuration for the tests is defined in the `jest.config.js` file located in the root directory of the library. This file contains settings for Jest, the testing framework used in this project. It specifies options such as the test environment, the locations of the test files, and the setup files to be used.

In addition to the Jest configuration, you may also need to set up environment variables for your tests. These can be defined in a `.env` file in the root directory of your project. The `dotenv` package can be used to load these environment variables when running your tests.

### 7.3. Run

To run the tests, navigate to the root directory of the custodialwalletutils library and run the following command:

```sh
npm run test
```

This command runs the Jest testing framework, which will find and execute all test files in the `__tests__/` directory. The results of the tests will be displayed in the terminal.

## 8. Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

## 9. Code of Conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

## 10. License

[Apache License 2.0](LICENSE)
