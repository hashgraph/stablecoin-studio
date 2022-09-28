<div align="center">

# Hedera Accelerator Stablecoin - Command Line Interface (CLI)

</div>

## Overview

Implementation of an Stable Coin Accelerator SDK for Command Line Interface (CLI).

## Building

### Pre-requirements

You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13` and `< v17`
- [npm](https://www.npmjs.com/)

You must have installed and built

1. [Contracts installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/contracts/README.md#installation)
2. [SDK installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/sdk/README.md#installation)

### Steps

From the root of the CLI project workspace:

1. Run `npm install`. This will create and populate `node_modules`.
2. Run `npm start`. This will display the CLI options.

## Commands

The CLI has the following commands availables:

### Wizard

Wizard may be run using the following command

```
npm start wizard [TASK OPTIONS]

TASK OPTIONS:
    --config      A path of config file.
    --network     Type of network that you want to use it. (mainnet | testnet | previewnet)
```

## 🧪 Testing

### Jest

[Jest](https://jestjs.io/es-ES/) is a JavaScript Testing Framework.

### Coverage

This project has a minimum of `70% line coverage`.

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
