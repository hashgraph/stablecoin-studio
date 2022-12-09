<div align="center">

# Hedera Accelerator Stablecoin - Command Line Interface (CLI)

[![WEB - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/web.test.yml)

</div>

## Overview

Implementation of an Stable Coin Accelerator SDK for React App.

## Building

### Pre-requirements

You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13` and `< v17`
- [npm](https://www.npmjs.com/)

You must have installed and built

1. [Contracts installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/sdk/README.md#installation)
3. [Hashconnect installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/hashconnect/lib/README.md#installation)

### Steps

From the root of the WEB project workspace:

1. Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
2. Run `npm start`. This will serve a web app and opens it in the browser.

# Usage

To use the WEB correctly it is necessary to have installed Hashpack or Metamask plugin in the browser to interact with the app

## Run app

```shell
npm run start
```

## Testing

### Jest

The project uses [Jest](https://jestjs.io/es-ES/) for testing.

### Run

Tests may be run using the following command

```shell
npm run test
```

## Support

If you have a question on how to use the product, please see our
[support guide](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

## Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

## Code of Conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

## License

[Apache License 2.0](LICENSE)
