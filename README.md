<div align="center">

# Hedera Stable Coin

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>


# Overview
Implementation of a group of tools composed by a CLI, SDK, UI and SmartContracts that facilitates the implementation and deployment of Stable Coins and their management.

# Project structure

There are 4 modules:
````
  /cli            
  /contracts    
  /sdk          
  /web          
````

- **`/cli`:** A CLI tool for Node to manage and operate on stable coins.
- **`/contracts`:** The solidity smart contracts on which the stable coins are based on.
- **`/sdk`:** The SDK that implements the features to manage and operate stable coins.
- **`/web`:** A DAPP developed with React to manage and operate on stable coins.

# Installing

In a terminal:

````
npm install
````
This will install the dependencies in all projects and setup the links between them.

You can now start developing on any of the modules.

# Building
When making modifications to any of the modules, you can:
````bash
  $ npm run build:cli
  $ npm run build:sdk
  $ npm run build:web
  $ npm run build:contracts
````

Or within any of the modules:
````bash
  $ cd [module] // sdk, web, contracts, etc
  $ npm run build
````


# Typescript

Typescript 4.7 or higher is highly reccomended to work with the repositories.


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

## License

[Apache License 2.0](LICENSE)
