<div align="center">

# Hedera Stable Coin SDK

[![SDK - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml)
[![Latest Version](https://img.shields.io/github/v/tag/hashgraph/hedera-accelerator-stablecoin?sort=semver&label=version)](README.md)
[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

# Table of contents
- [Overview](#overview)
- [Installation](#installation)
	- [Pre-requirements](#pre-requirements)
	- [Steps](#steps)
		- [For projects (WIP - when published)](#for-projects-wip---when-published)
		- [For development](#for-development)
- [Build](#build)
- [Quick Start](#quick-start)
	- [Initialization](#initialization)
	- [Connect SDK](#connect-sdk)
	- [Wallet Events](#wallet-events)
	- [About Operations Execution](#about-operations-execution)
- [Usage](#usage)
	- [StableCoin](#stablecoin)
		- [Create](#create)
		- [GetInfo](#getinfo)
		- [GetBalanceOf](#getbalanceof)
		- [Associate](#associate)
		- [isAccountAssociated](#isaccountassociated)
		- [CashIn](#cashin)
		- [Burn](#burn)
		- [Rescue](#rescue)
		- [Wipe](#wipe)
		- [Pause](#pause)
		- [Unpause](#unpause)
		- [Freeze](#freeze)
		- [Unfreeze](#unfreeze)
		- [Grant KYC](#grant-kyc)
		- [Revoke KYC](#revoke-kyc)
		- [Delete](#delete)
		- [GetReserveAddress](#getreserveaddress)
		- [Update Reserve Address](#update-reserve-address)
		- [Capabilities](#capabilities)
	- [Network](#network)
		- [Connect](#connect)
		- [Disconnect](#disconnect)
		- [SetNetwork](#setnetwork)
	- [Event](#event)
		- [Register](#register)
	- [Account](#account)
		- [GetPublicKey](#getpublickey)
		- [ListStableCoins](#liststablecoins)
		- [GetInfo](#getinfo-1)
	- [Role](#role)
		- [HasRole](#hasrole)
		- [GrantRole](#grantrole)
		- [GrantMultiRoles](#grantmultiroles)
		- [RevokeRole](#revokerole)
		- [RevokeMultiRole](#revokemultirole)
		- [GetRoles](#getroles)
		- [GetAllowance](#getallowance)
		- [ResetAllowance](#resetallowance)
		- [IncreaseAllowance](#increaseallowance)
		- [DecreaseAllowance](#decreaseallowance)
		- [IsLimited](#islimited)
		- [IsUnlimited](#isunlimited)
	- [Reserve Data Feed](#reserve-data-feed)
		- [Get Reserve Amount](#get-reserve-amount)
		- [Update Reserve Amount](#update-reserve-amount)
	- [Common](#common)
- [Testing](#testing)
	- [Jest](#jest)
- [Typescript](#typescript)
	- [Tsconfig](#tsconfig)
		- [Client side](#client-side)
		- [Server side](#server-side)
- [Support](#support)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

# Overview

This project provides an SDK to manage hedera tokens throughout their lifecycle.

This project based on hybrid tokens, that is, it uses Smart Contracts that communicate with Hedera to interact with them. It provides functionalities for use in server mode, as well as for web integration (currently supporting HashPack and Metamask).

For more information about the deployed contracts you can consult them in this project - [Contracts link](../contracts)

If you want to see server side implementation you can see it in this project - [Standalone](../cli)

If you want to see an example of a React web app you can see it in this project - [Web](../web)

# Installation

### Pre-requirements

You must have installed

- [node (version >16.17)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

### Steps

#### **For projects (WIP - when published)**

1. Run `npm install @hashgraph-dev/stablecoin-npm-sdk`. To install the dependency.
2. Import and use the SDK.

#### **For development**

To use this project in development mode you must follow the steps indicated in the following section [Build](#Build).

# Build

1. Clone the repo and open a terminal in the root folder
2. Run `node install.js`. To install all the dependencies and links.
3. `cd` into `./contracts`
4. Run `npm run build` to build the contracts.
5. `cd` into `./sdk`
6. Make your changes.
7. Run `npm run build` to build the SDK.
8. Import and use the SDK. Or use one of the example projects under `/examples`



# Quick Start
## Initialization

Before using the SDK we need to execute the `Network.init` function and specifiy the network:

Example
```Typescript
import { LoggerTransports, SDK } from '@hashgraph-dev/stablecoin-npm-sdk';
SDK.log = {
	level: process.env.REACT_APP_LOG_LEVEL ?? 'ERROR',
	transports: new LoggerTransports.Console(),
};
await Network.init(
	new InitializationRequest({
		network: 'testnet',
	}),
);
```  

In the configuration, you can also specify the addresses that will be invoked when creating a stable coin.
```Typescript
const init = await Network.init(
	new InitializationRequest({
		network: 'testnet',
		configuration: {
			factoryAddress: '0.0.0',
			hederaTokenManagerAddress: '0.0.0',
		},
	}),
);
```
## Connect SDK
The next step would be to connect to the network. Currently 3 types of connections are offered: Client (an Hedera account configured in an application configuration file), Metamask and HashPack. These 3 connection types are in the SupportedWallets enum.

```Typescript
export enum SupportedWallets {
	METAMASK = 'Metamask',
	HASHPACK = 'HashPack',
	CLIENT = 'Client',
}
```
In addition to this we have to specify the account id and private key for the Client, while HashPack and Metamask do not require an account in the request. 

Below are examples of each of them.

Client Example

```Typescript
await Network.connect(
      new ConnectRequest({
        account: {
          accountId: account.accountId,
          privateKey: {
            key: account.privateKey.key,
            type: account.privateKey.type,
          },
        },
        network: 'testnet',
        wallet: SupportedWallets.CLIENT,
      }),
    );
  }
```
HashPack Example

```Typescript
await Network.connect(
      new ConnectRequest({
        network: 'testnet',
        wallet: SupportedWallets.HASHPACK,
      }),
    );
  }
```

Metamask Example

```Typescript
await Network.connect(
      new ConnectRequest({
       	network: 'testnet',
        wallet: SupportedWallets.METAMASK,
      }),
    );
  }
```
## Wallet Events
Wallets fire the following events, see [Event.register](#Register) for more info. 

```Typescript
export enum WalletEvents {
	walletInit = 'walletInit',
	walletFound = 'walletFound',
	walletPaired = 'walletPaired',
	walletConnectionStatusChanged = 'walletConnectionStatusChanged',
	walletAcknowledgeMessage = 'walletAcknowledgeMessage',
	walletDisconnect = 'walletDisconnect',
}
```

# Usage
Next, all operations offered by this SDK, grouped by the files of the input ports in which they are located, will be explained.

## About Operations Execution
Before explaining all operations exposed by the SDK, is important to know something about the way some of this operations are going to be performed.
When creating a stable coin, a set of keys (supply key, wipe key, pause key, etc) must be provided in order to create the stable coin token. Each of theses keys will control, first of all, if the operation related with the key can be performed or not (if the token wipe key is not set, the wipe operation can not be performed), but, in the case the key is provided, depending on its value the operation could be performed through the stable coin smart contracts or through the Hedera SDK:

1. If the token key corresponds to a Hedera account public key, the operation can only be performed by the Hedera account owning this public key, and only through the Hedera SDK.
2. If the token key corresponds to the stable coin smart contract administrator key, the operation can only be performed through the smart contract, so whoever calls the smart contract could perform the operation. To prevent anyone from performing certain operations roles are used. When the needed of a role is indicated in some operations description, this is only when the related key of the stable coin token is configured to be the smart contract admin key.

## StableCoin
The following operations represents most of the operations that can be performed using a stable coin. Some of then can be perfomed through smart contracts or through the Hedera SDK depending on the token configuration explained above.

### Create
Creates a new stable coin. You must use Network.connect first with a SupportedWallet.

**Spec:**

```Typescript
	interface CreateRequest {
		name: string;
		symbol: string;
		decimals: number | string;
		initialSupply?: string;
		maxSupply?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: RequestPublicKey;
		freezeKey?: RequestPublicKey;
		KYCKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		treasury?: string;
		supplyType?: TokenSupplyType;
		stableCoinFactory: string;
		hederaTokenManager: string;
		reserveAddress?: string;
		reserveInitialAmount?: string;
		createReserve: boolean;
	}

	StableCoin.create = (request: CreateRequest): Promise<StableCoinViewModel>
```

**Example:**
### Create a simple stable coin, with all keys set to the Smart Contracts

This sets the smart contracts as the ones that will manage the features, this enables the usage of roles so multiple accounts can have the same role.

```Typescript
	import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest,
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			name: "Hedera Stable Coin",
			symbol: "HSC",
			decimals: 6,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			adminKey: Account.NullPublicKey,
			supplyKey: Account.NullPublicKey,
			freezeKey: Account.NullPublicKey,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
		})
	);
```

### Create a simple stable coin, with all keys set to the admin's public key

By requesting the public key of the account, we can set the stable coin's keys to be the admin's enabling all features through the Hedera Token Service. Keep in mind that multiple users per role is not available when using public keys.

```Typescript
	import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest,
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const privateKey: RequestPrivateKey = {
		key: 'someKey',
		type: 'ED25519',
	};
	const reqAccount: RequestAccount = {
		accountId: '0.0.1',
		privateKey: privateKey,
	};
	const req: GetPublicKeyRequest = new GetPublicKeyRequest({
		account: reqAccount,
	});
	const publicKey = Account.getPublicKey(req);
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			name: "Hedera Stable Coin",
			symbol: "HSC",
			decimals: 6,
			kycKey: publicKey,
			wipeKey: publicKey,
			pauseKey: publicKey,
			adminKey: publicKey,
			supplyKey: publicKey,
			freezeKey: publicKey,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
		})
	);
```

### Create a simple stable coin, with all keys set to none
 
By not setting any of the keys, the stable coin will have the corresponding features disabled and the key set to none

```Typescript
	import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest,
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			name: "Hedera Stable Coin",
			symbol: "HSC",
			decimals: 6,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
		})
	);
```

### GetInfo
Gets the information of an existing stable coin.

**Spec:**

```Typescript
	StableCoin.getInfo = (request: GetStableCoinDetailsRequest): Promise<StableCoinViewModel>
```

**Example:**

```Typescript
	const stableCoin: StableCoinViewModel = await StableCoin.getInfo(
		new GetStableCoinDetailsRequest({
			id: "0.0.1",
		})
	);
```


### GetBalanceOf
Gets the balance of tokens for an account.

**Spec:**

```Typescript
	StableCoin.getBalanceOf = (request: GetAccountBalanceRequest): Promise<Balance>
	
	type Balance = {
		value: BigDecimal
	}
```

**Example:**

```Typescript
	const result: Balance = await StableCoin.getBalanceOf(
		new GetAccountBalanceRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2",
		})
	);
	result.toString() // "1234"
	result.decimals // 2
```


### Associate
Associates a stable coin with an account.

**Spec:**

```Typescript
	StableCoin.associate = (request: AssociateTokenRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.associate(
		new AssociateTokenRequest({
			account: new HashPackAccount("0.0.1")
		})
	);
```


### isAccountAssociated
Checks if an account is associated with a stable coin.

**Spec:**

```Typescript
	StableCoin.isAccountAssociated = (request: IsAccountAssociatedTokenRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.isAccountAssociated(
		new IsAccountAssociatedTokenRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2"
		})
	);
```


### CashIn
Mints tokens and then transfers to to an account. The operating account must have the supplier role.

**Spec:**

```Typescript
	StableCoin.cashIn = (request: CashInRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.cashIn(
		new CashInRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2",
			amount: "1234",
		})
	);
```


### Burn
Burns an amount of tokens existing in the treasury account. The operating account must have the burn role.

**Spec:**

```Typescript
	StableCoin.burn = (request: BurnRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.burn(
		new BurnRequest({
			tokenId: "0.0.1",
			amount: "1234",
		})
	);
```


### Rescue
Transfers an amount of tokens existing in the treasury account to the account that invokes de operation. The operating account must have the rescue role.

**Spec:**

```Typescript
	StableCoin.rescue = (request: RescueRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.rescue(
		new RescueRequest({
			tokenId: "0.0.1",
			amount: "1234",
		})
	);
```


### Wipe
Wipes an amount of tokens from an account. The operating account must have the wipe role.

**Spec:**

```Typescript
	StableCoin.wipe = (request: WipeRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.wipe(
		new WipeRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2",
			amount: "1234",
		})
	);
```


### Pause
Pauses a stable coin. None of the operations can be taken while the stable coin is in paused state. The operating account must have the pause role.

**Spec:**

```Typescript
	StableCoin.pause = (request: PauseRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.pause(
		new PauseRequest({
			tokenId: "0.0.1",
		})
	);
```

### Unpause
Unpauses a stable coin. If the stable coin is not paused it will throw an exception. The operating account must have the pause role.

**Spec:**

```Typescript
	StableCoin.unPause = (request: PauseRequest): Promise<boolean>
```

**Example:**

```Typescript
	await StableCoin.unPause(
		new PauseRequest({
			tokenId: "0.0.1",
		})
	);
```

### Freeze
Freezes transfers of a stable coin for an account. The operating account must have the freeze role.

**Spec:**

```Typescript
	StableCoin.freeze = (request: FreezeRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.freeze(
		new FreezeRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2"
		})
	);
```

### Unfreeze
Unfreezes transfers of a stable coin for an account. The operating account must have the freeze role.

**Spec:**

```Typescript
	StableCoin.unFreeze = (request: FreezeRequest): Promise<boolean>
```

**Example:**

```Typescript
	await StableCoin.unFreeze(
		new FreezeRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2"
		})
	);
```

### Grant KYC
Grants KYC to an account. If a Token has KYC enabled, only accounts with KYC can operate it. The operating account must have the KYC role.

**Spec:**

```Typescript
	StableCoin.grantKyc(request: KYCRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.grantKyc(
		new KYCRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2"
		})
	);
```

### Revoke KYC
Revokes KYC from an account. If a Token has KYC enabled, only accounts with KYC can operate it. The operating account must have the KYC role.

**Spec:**

```Typescript
	StableCoin.revokeKyc(request: KYCRequest): Promise<boolean> 
```

**Example:**

```Typescript
	await StableCoin.revokeKyc(
		new KYCRequest({
			tokenId: "0.0.1",
			targetId: "0.0.2"
		})
	);
```


### Delete
Deletes a stable coin. **Important** this operation is not reversible.

**Spec:**

```Typescript
	StableCoin.delete = (request: DeleteRequest): Promise<boolean>
```

**Example:**

```Typescript
	await StableCoin.delete(
		new DeleteRequest({
			tokenId: "0.0.1",
		})
	);
```


### GetReserveAddress
Gets the contract reserve address.

**Spec:**

```Typescript
	StableCoin.getReserveAddress(request: GetReserveAddressRequest): Promise<string>;

```

**Example:**

```Typescript
	const result: string = await StableCoin.getReserveAddress(
		new GetReserveAddressRequest({
			tokenId: "0.0.1",
		})
	);	
```


### Update Reserve Address
Updates the contract reserve address.

**Spec:**

```Typescript
	StableCoin.updateReserveAddress = (request: UpdateReserveAddressRequest,): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await StableCoin.updateReserveAddress(
		new GetReserveAddressRequest({
			tokenId: "0.0.1",
			reserveAddress: "0.0.54445787"
		})
	);	
```

### Grant KYC
Grants KYC status to an account for a specific stable coin.

**Spec:**

```Typescript
	StableCoin.updateReserveAddress = (request: UpdateReserveAddressRequest,): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await StableCoin.grantKyc(
		new KYCRequest({
			tokenId: "0.0.1",
			targetId: "0.0.1"
		})
	);
```

### Revoke KYC
Revokes KYC status to an account for a specific stable coin.

**Spec:**

```Typescript
	StableCoin.updateReserveAddress = (request: UpdateReserveAddressRequest,): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await StableCoin.revokeKyc(
		new KYCRequest({
			tokenId: "0.0.1",
			targetId: "0.0.1"
		})
	);
```

### Capabilities
Get capabilities for an account on a stable coin. Capabilties have a reference of all the details of the stable coin querying to, the list of capabilities and the account the capabilities belong to. Each capability determines the type of operation that can be performed (cash in, burn, wipe, etc) and on wether it should be done onto the smart contract for the stable coin (proxyAddress in the `coin: StableCoin` attribute) or through the Hedera Token Service. 

See the spec below for all the atributes you can get from the request.

**Spec:**

```Typescript
	StableCoin.capabiltities = (request: CapabilitiesRequest): Promise<StableCoinCapabilities>
	
	class StableCoinCapabilities {
		constructor(
			public readonly coin: StableCoin,
			public readonly capabilities: Capability[],
			public readonly account: Account,
		) {}
	}
	
	enum Operation {
		CASH_IN = 'Cash_in',
		BURN = 'Burn',
		WIPE = 'Wipe',
		FREEZE = 'Freeze',
		UNFREEZE = 'Unfreeze',
		PAUSE = 'Pause',
		UNPAUSE = 'Unpause',
		DELETE = 'Delete',
		RESCUE = 'Rescue',
		ROLE_MANAGEMENT = 'Role_Management',
		ROLE_ADMIN_MANAGEMENT = 'Admin_Role',
		RESERVE_MANAGEMENT = 'Admin_Role',
		GRANT_KYC = 'Grant_KYC',
		REVOKE_KYC = 'Revoke_KYC',
	}

	enum Access {
		HTS,
		CONTRACT,
	}
	
	class Capability {
		constructor(
			public readonly operation: Operation,
			public readonly access: Access,
		) {}
	}
	
	class Account {
		constructor(
			public id: HederaId;
			public evmAddress?: string;
			public privateKey?: PrivateKey;
			public publicKey?: PublicKey;
		) {}
	}
	
	class StableCoin {
		constructor(
			public name: string;
			public symbol: string;
			public decimals: number;
			public adminKey?: PublicKey | ContractId;
			public initialSupply?: BigDecimal;
			public totalSupply?: BigDecimal;
			public maxSupply?: BigDecimal;
			public memo?: string;
			public proxyAddress?: HederaId;
			public evmProxyAddress?: string;
			public freezeKey?: PublicKey | ContractId;
			public freezeDefault?: boolean;
			public kycKey?: PublicKey | ContractId;
			public wipeKey?: PublicKey | ContractId;
			public pauseKey?: PublicKey | ContractId;
			public paused?: boolean;
			public supplyKey?: PublicKey | ContractId;
			public treasury?: HederaId;
			public tokenType?: TokenType;
			public supplyType?: TokenSupplyType;
			public tokenId?: HederaId;
			public autoRenewAccount?: HederaId;
			public autoRenewAccountPeriod?: number;
			public deleted?: boolean;
		) {}
	}
```

**Example:**

```Typescript
	const result: StableCoinCapabilities = await StableCoin.capabiltities(
		new GetAccountBalanceRequest({
			account: {
			  accountId: "0.0.1",
			},
			tokenId: "0.0.2",
		})
	);
```


## Network

### Connect
Establishes the connection to work with an existing Hedera account in a wallet in a certain Hedera network.

**Spec:**
	
	
```Typescript
	Network.connect(req: ConnectRequest): Promise<InitializationData>;
```

**Example:**

```Typescript
	await Network.connect(
		new ConnectRequest({
        		network: 'testnet',
        		wallet: SupportedWallets.HASHPACK,
      		}),
	);
```

### Disconnect
Disconnects the previously established connection.

**Spec:**
	
	
```Typescript
	Network.disconnect(): Promise<boolean>;
```

**Example:**

```Typescript
	await Network.disconnect();
```

### SetNetwork
Configures an Hedera network, setting some properties like environment, mirror nodes, consensus nodes and a RPC node.

**Spec:**
	
	
```Typescript
	Network.setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
```

**Example:**

```Typescript
	await Network.setNetwork(
		new SetNetworkRequest({
			enviroment: 'testnet';
			mirrorNode: 'https://testnet.mirrornode.hedera.com/'
			consensusNodes: []
		})
	);
```
	
	
## Event

### Register
Registers for wallet events. All event listeners are optional, just make sure to call it before trying to pair with any wallet, since pairing events can occur right when the page loads and the extension is found, if the wallet was paired previously.

Multiple wallets can emit events, so make sure to filter them by the `wallet` attribute available in all of them indicating which wallet is emitting the event. All supported wallets emit the same events.

All events use the [standard node event emitting system](https://nodejs.dev/es/learn/the-nodejs-event-emitter/) and listeners are fully TS typed.

**Spec:**

```Typescript
	Event.register = (events: Partial<WalletEvent>): void;
	
	type WalletEvent = {
		walletInit: (data: WalletInitEvent) => void;
		walletFound: (data: WalletFoundEvent) => void;
		walletPaired: (data: WalletPairedEvent) => void;
		walletConnectionStatusChanged: (
			data: WalletConnectionStatusChangedEvent,
		) => void;
		walletAcknowledgeMessage: (data: WalletAcknowledgeMessageEvent) => void;
		walletDisconnect: (data: WalletBaseEvent) => void;
	};
	
	interface WalletBaseEvent {
		wallet: SupportedWallets;
	}

	interface WalletInitEvent extends WalletBaseEvent {
		initData: InitializationData;
	}

	interface WalletFoundEvent extends WalletBaseEvent {
		name: string;
	}
	
	interface WalletPairedEvent extends WalletBaseEvent {
		data: InitializationData;
		network: Environment;
	}
	
	interface WalletConnectionStatusChangedEvent extends WalletBaseEvent {
		status: ConnectionState;
	}

	interface WalletAcknowledgeMessageEvent extends WalletBaseEvent {
		result: boolean;
	}
```

**Example:**

Check out [Router.tsx](https://github.com/hashgraph/hedera-accelerator-stablecoin/blob/main/web/src/Router/Router.tsx) from the web repository for a comprehensive example in React of how to subscribe to events.

## Account
The following operations give information about Hedera accounts using Hedera mirror nodes, so do not imply any cost.

### GetPublicKey
Gets the account public key.

**Spec:**
	
```Typescript
	Account.getPublicKey(request: GetPublicKeyRequest): Promise<PublicKey>;
```

**Example:**

```Typescript
	await Account.getPublicKey(
		new GetPublicKeyRequest({
			account: '0.0.49172343';
		})
	);
```
	
### ListStableCoins
Gets a list of stable coins associated with an account.

**Spec:**	
	
```Typescript
	Account.listStableCoins(request: GetListStableCoinRequest,): Promise<StableCoinListViewModel>;
```

**Example:**

```Typescript
	await Account.listStableCoins(
		new GetPublicKeyRequest({
			account: '0.0.49172343';
		})
	);
```

### GetInfo
Gets an account information.

**Spec:**
	
```Typescript
	Account.getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
```

**Example:**

```Typescript
	await Account.getInfo(
		new GetAccountInfoRequest({
			account: '0.0.49172343';
		})
	);
```


## Role
Roles allow Hedera accounts to perform certain operations on a stable coin through the smart contracts, so operations that can be performed through Hedera SDK, due to the token configuration, do not need any role to be performed . The roles management, to which the following operations belong, can only be performed by a Hedera account having the admin role.

### HasRole
Checks if an account has a certain role for a stable coin.

**Spec:**
		
```Typescript
	Role.hasRole(request: HasRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.hasRole(
		new HasRoleRequest({
			tokenId: "0.0.1",
			targetId: "0.046172343",
			role: StableCoinRole.CASHIN_ROLE,
		})
	);
```

### GrantRole
Grants a role to an account for a certain stable coin.

**Spec:**
		
```Typescript
	Role.grantRole(request: GrantRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.grantRole(
		new GrantRoleRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			role: StableCoinRole.CASHIN_ROLE,
		})
	);
```
### GrantMultiRoles
Grants multiple roles to multiple accounts for a certain stable coin.

**Spec:**
		
```Typescript
	Role.grantMultiRoles(request: GrantMultiRolesRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.grantMultiRoles(
		new GrantMultiRolesRequest({
			targetsId: ['0.0.46172343', '0.0.45587454']
			tokenId: '0.0.49135648',
			roles: [StableCoinRole.CASHIN_ROLE,StableCoinRole.BURN_ROLE],
			amounts: [12, 35]
		})
	);
```

### RevokeRole
Revokes a role of an account for a certain stable coin.

**Spec:**	
	
```Typescript
	Role.revokeRole(request: RevokeRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.revokeRole(
		new RevokeRoleRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			role: StableCoinRole.CASHIN_ROLE,
		})
	);
```
### RevokeMultiRole
Revokes multiple roles from multiple accounts for a certain stable coin.

**Spec:**	
	
```Typescript
	Role.revokeMultiRoles(request: RevokeMultiRolesRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.revokeMultiRoles(
		new RevokeMultiRolesRequest({
			targetsId: ['0.0.46172343', '0.0.45587454']
			tokenId: '0.0.49135648',
			roles: [StableCoinRole.CASHIN_ROLE,StableCoinRole.BURN_ROLE],
		})
	);
```

### GetRoles
Gets a list of all roles a Hedera account has for a certain stable coin.

**Spec:**	
	
```Typescript
	Role.getRoles(request: GetRolesRequest): Promise<string[]>;
```

**Example:**

```Typescript
	await Role.getRoles(
		new GetRolesRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648'
		})
	);
```

### GetAllowance
Gets the supplier allowance (amount of tokens that can be minted by an account) for a certain account and a stable coin.

**Spec:**	
	
```Typescript
	Role.getAllowance(request: GetSupplierAllowanceRequest): Promise<Balance>;
```

**Example:**

```Typescript
	await Role.getAllowance(
		new GetSupplierAllowanceRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			
		})
	);
```

### ResetAllowance
Sets the supplier allowance to 0 for a certain account and a stable coin.

**Spec:**
	
```Typescript
	Role.resetAllowance(request: ResetSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.resetAllowance(
		new ResetSupplierAllowanceRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			
		})
	);
```

### IncreaseAllowance
Increases the supplier allowance amount for a certain account and a stable coin.

**Spec:**
	
```Typescript
	Role.increaseAllowance(request: IncreaseSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.increaseAllowance(
		new IncreaseSupplierAllowanceRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			amount: 1000
		})
	);
```
 
### DecreaseAllowance
Decreases the supplier allowance amount for a certain account and a stable coin.

**Spec:**	
	
```Typescript
	Role.decreaseAllowance(request: DecreaseSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.decreaseAllowance(
		new DecreaseSupplierAllowanceRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			amount: 1000
		})
	);
```

### IsLimited
Checks if a certain account has a limited supplier allowance for a stable coin or not.

**Spec:**
	
```Typescript
	Role.isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.isLimited(
		new CheckSupplierLimitRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			supplierType: 'limited'
		})
	);
```

### IsUnlimited
Checks if a certain account has an unlimited supplier allowance for a stable coin or not.

**Spec:**
		
```Typescript
	Role.isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.isUnlimited(
		new CheckSupplierLimitRequest({
			targetId: '0.046172343'
			tokenId: '0.0.49135648',
			supplierType: 'unlimited'
		})
	);
```    

## Reserve Data Feed
The following operations are always performed through smart contracts calls, since reserve data feed is a contract which can be deployed alongside the stable coin.
Getting the reserve amount can be performed by anyone while updating this amount can only be performed by the previously commented smart contract administrator.

### Get Reserve Amount
Gets the reserve amount for certain stable coin.

**Spec:**

```Typescript
	ReserveDataFeed.updateReserveAmount = (request: UpdateReserveAmountRequest): Promise<boolean>
```

**Example:**

```Typescript
	const balance:boolean = await ReserveDataFeed.updateReserveAmount(
		new UpdateReserveAmountRequest({
			reserveAddress: "0.1.1",
			reserveAmount: 1
		})
	);
```

### Update Reserve Amount
Updates the reserve amount for certain stable coin.

**Spec:**

```Typescript
	ReserveDataFeed.getReserveAmount = (request: GetReserveAmountRequest): Promise<Balance>;
```

**Example:**

```Typescript
	const balance:Balance = await ReserveDataFeed.getReserveAmount(
		new GetReserveAmountRequest({
			tokenId: "0.1.1"
		})
	);
```

## Factory
The following operations are always performed through smart contracts calls.

### Get HederaTokenManager List
Get a list of hedera TokenManager addressess stored in the factory.

**Spec:**

```Typescript
	Factory.getHederaTokenManagerList = (request: GetTokenManagerListRequest): Promise<ContractId[]>;
```
**Example**
```Typescript
	const list = await Factory.getHederaTokenManagerList(
			new GetTokenManagerListRequest({ factoryId: FACTORY_ADDRESS }),
		);
```

### Get HederaTokenManager byindex
Get a HederaTokenManager address stored in the factory finde by index.

**Spec:**

```Typescript
	Factory.getHederaTokenManagerByIndex = (request: GetTokenManagerByIndexRequest): Promise<ContractId>;
```
**Example**
```Typescript
	const hederaTokenManager = await Factory.getHederaTokenManagerByIndex(
			new GetTokenManagerByIndexRequest({ factoryId: FACTORY_ADDRESS ,
			index: 0}),
		);
```

## Common
The SDK class is exported. This static class allows to set the log level and application metadata at any point in your code, just import it and change the values.

We use [winston](https://github.com/winstonjs/winston) under the hood for logging, so all transports are exported from the SDK under `LoggerTransports` for you to use. Refer to the [documentation](https://github.com/winstonjs/winston/blob/master/docs/transports.md) for more information on what transports are available.

```Typescript
	import { LoggerTransports, SDK } from '@hashgraph-dev/stablecoin-npm-sdk';
	
	const { Console } = LoggerTransports;
	
	SDK.appMetadata = {
		name: 'Hedera Stable Coin',
		description: 'Example application',
		icon: 'https://example.png',
		url: '',
	};
	
	SDK.log = {
		level: 'ERROR', // or 'TRACE' | 'INFO'
		transports: new Console(),
	};
```

# Testing

### Jest

The project uses Jest for testing. To execute the tests, simply run `npm run test` in the terminal, this will output the coverage as well.

# Typescript

Typescript 4.7 or higher is highly reccomended to work with the SDK.

## Tsconfig

### Client side

An example of a tsconfig.json for client-side applications (React):

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "allowJs": false,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "types": ["node", "jest"],
    "resolveJsonModule": true
  },
  "include": ["src", "svg.d.ts"],
  "exclude": ["node_modules"]
}
```

### Server side

An example of a tsconfig.json for server-side applications (Node):

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
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

## License

[Apache License 2.0](LICENSE)
