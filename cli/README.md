<div align="center">

# Hedera Accelerator Stablecoin - Command Line Interface (CLI)
[![CLI - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/cli.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/cli.test.yml)
</div>

## Overview

Implementation of an Stable Coin Accelerator SDK for Command Line Interface (CLI).

## Building

### Pre-requirements

You must have installed

- [Node.js](https://nodejs.org/) `>= v16.13` and `< v17`
- [npm](https://www.npmjs.com/)

You must have installed and built

1. [Contract installation](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/contracts/README.md#installation)
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

The CLI has the following commands available:

### Wizard

Wizard may be run using the following command:

```
npm start wizard [TASK OPTIONS]

TASK OPTIONS:
    -cp, --config      The path of the config file.
    -n, --network      Type of network that you want to use. (mainnet | testnet | previewnet)
    -lv, --log-level   Log level to use (TRACE, INFO, ERROR)
    -lp, --log-path    Log path, default is ./logs
```

# Usage

To use the CLI correctly it is necessary to generate a configuration file in which the default network and the accounts with which you want to operate in the network will be indicated. These parameters can be modified later on, from the CLI.

## Config file

The configuration file that is generated populates its fields with dynamic questions when the CLI is started for the first time.
The file format is .yaml and the structure is as follows:

```
defaultNetwork: 'testnet'
networks:
  [
    {
      name: 'mainnet',
      consensusNodes: [],
      mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com/',
    },
    {
      name: 'previewnet',
      consensusNodes: [],
      mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com/',
    },
    {
      name: 'testnet',
      consensusNodes: [],
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    },
  ]
accounts:
  [
    {
      accountId: '',
      privateKey: { key: '', type: '' },
      network: '',
      alias: '',
      importedTokens: [],
    },
  ]
logs:
  path: './logs'
  level: 'ERROR'
```

## CLI flow

![Alt text](docs/images/CLI-flow.png?raw=true 'CLI flow')

When the CLI is started with the configuration file properly configured. The first action will be to select the account you want to operate with. By default, the list of configured accounts belonging to the default network indicated in the file is displayed.

If there are no accounts in the file for the default network, a warning message will be displayed and a list of all the accounts in the file will be shown.

When an account is selected, the main menu (shown in the previous image) is accessed. It will operate in the network to which the account belongs.

#### Main Menu

From the main menu users are able to use the following actions:

1. Create a new Stable Coin
2. Manage imported tokens
3. Operate with an existing Stable Coin
4. List Stable Coins
5. Configuration

#### Operate with Stable Coin

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
- DELETE_ROLE

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

<div align="center">

# Quickstart


</div>


- [Introduction](#introduction)<br>
- [First run](#first-run)<br>
- [Main menu](#main-menu)<br>
  - [Create a new Stable Coin](#create-a-new-stable-coin)<br>
  - [Manage imported tokens](#manage-imported-tokens)<br>
  - [Operate with an existing Stable Coin](#operate-with-an-existing-stable-coin)<br>
  - [List Stable Coins](#list-stable-coins)<br>
  - [Configuration](#configuration)<br>


<br></br>


## Introduction
This Stable Coin Accelerator is a tool that help developers and companies to generate an Stable Coin in a easiest way and enable start with some common test that could be extend as you like.


# First run
First time you execute the "accelerator wizard" command in your terminal, if you haven't added your default configuration path the interface will ask you wether you want create a new configuration file in the default path. When the configuration file is created you must configure the default network and at least, one default account. This account could be created through [HashPack](https://www.hashpack.app/download) or [Hedera Developer Portal](https://portal.hedera.com/register). 


https://user-images.githubusercontent.com/102601367/205074337-a1f09813-9434-42e9-972b-1c40655bb1d1.mov


*Note that for testing purpose you should create a **Testnet** account instead of Mainnet account. Everything executed on Mainnet will incur a cost with real money.*


## Main menu
When your configuration file is set up and at lest one account is added and selected, you are able to see the differents options that ara availables.

## Create a new Stable Coin
With this option you are able to create a new stable coin adding the mandatory details like Name, Symbol and Autorenew account. Autorenew account in that case should be the same like the user current account.

After the minimum details has been added, you have been asked if you want to add optional details like the number of decimals places a token is divisibly by, initial supply or max supply. If you say no, you will be set the default values.

Another question is prompt asking if you would like that smart contracts will be used for role management. This feature is only available when the smart contract keys are set for some of the following token options: supply, wipe, freeze, pause, delete. If you let the smart contract to execute this operation, you are able to grant and revoke this features to other accounts. By default, the user that creates the stable coin are granted with all the roles only if the smartContract is the owner for all the operations.


Wether you asnwer "No" to the last questions, you will be prompted with an individual answer for all keys: admin key, supply key, wipe key, freeze key. For each one you can select the SmartContract, the current user key, other publick key o None. When you select the "user current key" or another "public key", the users that their keys matches with the specific feature, could perform the actions through HTS instead of SmartContract. 

When you have added an existing stable coin, you will able to operate with the roles that the admin granted to you. If after you added the stable coin the admin granted to you another one, you can update the roles that you have.


https://user-images.githubusercontent.com/102601367/205074369-b3a72bb2-61f9-421a-9738-abb1ca65375e.mov



## Manage imported tokens
If you have granted with a role or your key matches with some of the keys from the stable coin operations and you are not the stable coin creator, you could added to you command line and operate with. You should only know the token id, if the token added it's a valid token, you can operate with 

## Operate with an existing Stable Coin
Once a stable coin is created or added, you can operate with it. When you select this option all stable coins creatd by you or added will be displayed and you were able to choose with which want to operate

The following list has all the possible operations which the user will can perform wether they has the role to do it.
- **Cash in**: Min tokens and transfer to an account

https://user-images.githubusercontent.com/102601367/205074103-e9f584d0-8262-406c-b45b-a9060a9aa32d.mov


- **Details**: Get the stable coin details
- **Balance**: Get the balance from an account
- **Burn**: Burn tokens from treasury account

https://user-images.githubusercontent.com/102601367/205074150-4f35c38d-998b-423a-8378-2b795997c0cc.mov


- **Wipe**: Burn tokens from an account

https://user-images.githubusercontent.com/102601367/205074204-d7f0def7-ffbd-416a-8263-608a49c41708.mov


- **Rescue**: Transfer tokens from the treasury account to the rescue account. This option is only available through the Smart Cotnracts

https://user-images.githubusercontent.com/102601367/205074235-32145a1b-4ce0-4913-bd18-1252ecff52d6.mov


- **Freeze**: Freeze an account. This option freeze transfers of the specified token for the account.
- **Unfreeze**: Unfreeze an account. This option unfreeze transfers of the specified token for the account.

https://user-images.githubusercontent.com/102601367/205074293-73156a99-fc65-41ba-9a45-0be08ca5837e.mov


- **Role management**: Grant/Revoke/Edit/Check roles from the operations whose keys are set to the smart contract
- **Danger Zone**:
- - **Un/Pause**: Pause and unpause prevents the token from being involved in any kind of operations.
- - **Delete**: Marks a token as deleted. This actions cannot be undone.

## List Stable Coins
This operation display all the stable coins that the user has been created or added.

## Configuration
This last option allows the users to display the current configuration file, modify the configuration path, change the default network and manage the accounts allowing it change the current account, add new ones or remove some of them from the configuration.

## License

[Apache License 2.0](LICENSE)
