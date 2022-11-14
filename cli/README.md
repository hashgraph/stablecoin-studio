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
3. [Hashconnect installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/hashconnect/lib/README.md#installation)

### Steps

From the root of the CLI project workspace:

1. Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.
2. Run `npm start`. This will display the CLI options.

or

1. Run `npm start:wizard`. To start the CLI in wizard mode creating a config file in the project folder.
2. Run `npm start wizard`. To start the CLI in wizard mode when you will be able to configure the path of the config file.

## Commands

The CLI has the following commands availables:

### Wizard

Wizard may be run using the following command

```
npm start wizard [TASK OPTIONS]

TASK OPTIONS:
    -cp, --config      A path of config file.
    -n, --network     Type of network that you want to use it. (mainnet | testnet | previewnet)
```

# Usage

To use the CLI correctly it is necessary to generate a configuration file in which the default network and the accounts with which you want to operate in the network will be indicated. These parameters can be modified later on, from the CLI.

## Config file

The configuration file that is generated populates its fields with dynamic questions when the CLI is started for the first time.
The file format is .yaml and the structure is as follows:

```
defaultNetwork: testnet
networks:
  - name: mainnet
    consensusNodes: []
    mirrorNodeUrl: https://mainnet.mirrornode.hedera.com/
  - name: previewnet
    consensusNodes: []
    mirrorNodeUrl: https://previewnet.mirrornode.hedera.com/
  - name: testnet
    consensusNodes: []
    mirrorNodeUrl: https://testnet.mirrornode.hedera.com
accounts:
  - accountId:
    privateKey:
      key:
      type:
    network:
    alias:
```

## CLI flow

![Alt text](docs/images/CLI-flow.png?raw=true 'CLI flow')

When the CLI is started with the configuration file properly configured. The first action will be to select the account you want to operate with. By default, the list of configured accounts belonging to the default network indicated in the file is displayed.

If there are no accounts in the file for the default network, a warning message will be displayed and a list of all the accounts in the file will be shown.

When an account is selected, the main menu shown in the previous image is accessed. It will operate in the network to which the account belongs.

#### Main Menu

From the main menu users are able to use the following functions:

1. Create new stable coins
2. Operate with previously created stable coins
3. List the stable coins for which they have permissions.
4. Access the configuration menu.

#### Operate with stable coin

The operations that can be performed with a stable coin are as follows:

1. Cash in
2. Details
3. Balance
4. Burn
5. Wipe
6. Rescue
7. Role management

#### Role management

Administrators of a stable coin are able to manage user roles from this menu, being able to give, revoke and edit roles.

1. Grant role
2. Revoke role
3. Edit
4. Has role

The available roles are:

- CASHIN_ROLE
- BURN_ROLE
- WIPE_ROLE
- RESCUE_ROLE
- PAUSE_ROLE
- FREEZE_ROLE

#### Configuration menu

1. Show configuration
2. Edit config path
3. Edit default network
4. Manage accounts

#### Manage accounts

1. Change account
2. List account
3. Add new account
4. Delete account

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
