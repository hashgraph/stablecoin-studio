[![codecov](https://img.shields.io/codecov/c/github/hashgraph/hedera-accelerator-stablecoin/main)](https://codecov.io/gh/hashgraph/hedera-accelerator-stablecoin)
[![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://hedera.com/discord)

# Hedera Stablecoin Accelerator

This project implements a minimally viable Stablecoin solution on Hedera and is intended to be used as a starting point for projects wanting to deploy a Stablecoin on the Hedera Hashgraph public network.

## Overview

## Architecture

## Getting Started

### Prerequisites

1. Install dependencies:

```
npm install
```

2. Compile smart contracts:

```
truffle compile --all
```

### Deploying

You can configure the application with the following environment variables (setup in .env or operating system environment).

copy `.env.sample` to `.env`

edit `.env`

- **`HEDERA_NETWORK`**: We use this to establish the hedera network in which tests will be executed. All tests were executed in testnet, so this is the recommended network to set here.

- **`OPERATOR_ID`**: Operator account identifier, in x.y.z format, of the account used both to create other EOA (External Owned Accounts), used during tests, and to execute some transactions. EOA account balances will be obtained from this operator account.

- **`OPERATOR_KEY`**: Operator account private key, needed to use operator account.

- **`TOKEN_NAME`**: Name of the token.

- **`TOKEN_SYMBOL`**: Symbol of the token.

- **`TOKEN_DECIMALS`**: Number of decimals of the token.

### Running

### Testing

Note, tests consume a large number of hbar which may require you to collect hbar from several testnet accounts in order to ensure you have sufficient funds.

Alternatively, consult the next section related to running the tests against a local network.

Tests are located in the following files. They can be executed both individually and all together.

1. Executing all tests:

```
npm test
```

This execution needs an account with a balance of around 4.000 hbars.

2. Executing individual tests:

**ERC20.test.mjs**: Basic ERC20 functionality tests.

```
npm test test/ERC20.test.mjs
```

**rescue.test.mjs**: Both token and Hbar rescue functionalities tests.

```
npm test test/rescue.test.mjs
```

**scenario.test.mjs**: Three different scenarios for minting tests.

```
npm test test/scenario.test.mjs
```

**supply.test.mjs**: Supply functionality tests.

```
npm test test/ERC20.test.mjs
```

**supplyController.test.mjs**: SupplyController contract functionality tests.

```
npm test test/supplyController.test.mjs
```

**upgradeGeneralHederaERC20.test.mjs**: HederaERC20 contract upgradeability tests.

```
npm test test/upgradeGeneralHederaERC20.test.mjs
```

**upgradeGeneralSupplyController.test.mjs**: SupplyController contract upgradeability tests.

```
npm test test/upgradeGeneralSupplyController.test.mjs
```

### Local network

This project includes [Hedera Local Node](https://github.com/hashgraph/hedera-local-node#docker) as an alternative to testnet.

#### Start

```
npx hedera-local start --accounts=0
```

#### Generating a test account

By default, Hedera Local Node doesn't have any test accounts, only a genesis account (0.0.2) and optionally accounts with ECDSA keys.
To run the tests, you'll need an account with an ED25519 key which you can create with the `./src/createLocalNodeAccount.js` script.

This will create a new account with a hardcoded private key `302e020100300506032b657004220420b50db9e93d9dfc0ad37380a05b8dac0bc8de1f34c6868fd738b5a5210e287db7` which you can include in the `.env` file. Also specify `HEDERA_NETWORK=local` in the same `.env` file, for example:

```shell
HEDERA_NETWORK=local
OPERATOR_ID=0.0.1001
OPERATOR_KEY=302e020100300506032b657004220420b50db9e93d9dfc0ad37380a05b8dac0bc8de1f34c6868fd738b5a5210e287db7
```

#### Stop

```
npx hedera-local stop
```

#### Restart

```
npx hedera-local restart
```

### Documentation

## Releasing

To perform a new release, run the `Automated Release` GitHub workflow.

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
