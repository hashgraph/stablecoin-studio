<div align="center">

# Hedera Stable Coin SDK

[![SDK - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml)
[![Latest Version](https://img.shields.io/github/v/tag/hashgraph/hedera-accelerator-stablecoin?sort=semver&label=version)](README.md)
[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

# Table of contents

- [Hedera Stable Coin SDK](#hedera-stable-coin-sdk)
- [Table of contents](#table-of-contents)
- [Overview](#overview)
- [Installing](#installing)
		- [Pre-requirements](#pre-requirements)
		- [Steps](#steps)
			- [**For projects (WIP - when published)**](#for-projects-wip---when-published)
			- [**For development**](#for-development)
		- [Example (JS)](#example-js)
		- [Example (TS)](#example-ts)
	- [Before using](#before-using)
- [Basic Types](#basic-types)
	- [AccountId](#accountid)
		- [Fields](#fields)
		- [Example](#example)
	- [Account](#account)
		- [Fields](#fields-1)
	- [EOAccount](#eoaccount)
		- [Fields](#fields-2)
		- [Example](#example-1)
	- [HashPackAccount](#hashpackaccount)
		- [Fields](#fields-3)
		- [Example](#example-2)
	- [PrivateKey](#privatekey)
		- [Fields](#fields-4)
		- [Example](#example-3)
	- [PrivateKeyType [WIP]](#privatekeytype-wip)
		- [Example](#example-4)
	- [PublicKey](#publickey)
		- [Fields](#fields-5)
		- [Example](#example-5)
	- [ContractId](#contractid)
		- [Fields](#fields-6)
		- [Example](#example-6)
- [Usage](#usage)
		- [**Important**](#important)
	- [Create Stable Coin](#create-stable-coin)
	- [Get capabilities stable coin](#get-capabilities-stable-coin)
	- [Get stable coin list](#get-stable-coin-list)
	- [Get Stable Coin](#get-stable-coin)
	- [Get Balance Of](#get-balance-of)
	- [Cash in](#cash-in)
	- [Cash out](#cash-out)
	- [Associate token](#associate-token)
	- [Wipe tokens](#wipe-tokens)
	- [Rescue tokens](#rescue-tokens)
	- [Supplier allowance](#supplier-allowance)
	- [Reset supplier allowance](#reset-supplier-allowance)
	- [Increase supplier allowance](#increase-supplier-allowance)
	- [Decrease supplier allowance](#decrease-supplier-allowance)
	- [Is supplier allowance limited](#is-supplier-allowance-limited)
	- [Is supplier allowance unlimited](#is-supplier-allowance-unlimited)
	- [Grant Role](#grant-role)
	- [Revoke Role](#revoke-role)
	- [Has role](#has-role)
	- [Get account info](#get-account-info)
	- [Get roles](#get-roles)
	- [Check string is valid address](#check-string-is-valid-address)
	- [Public key from private key](#public-key-from-private-key)
	- [Hashpack](#hashpack)
		- [Utilities](#utilities)
			- [Get Availability Extension](#get-availability-extension)
			- [Get HashConnect Conection Status](#get-hashconnect-conection-status)
			- [Get Init Data](#get-init-data)
			- [Disconect Haspack](#disconect-haspack)
			- [Connect Wallet](#connect-wallet)
		- [Events](#events)
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

Hedera supports the creation of tokens and stable coins. This SDK aims to help in deploying, managing and operating with stable coins in the Hedera network.

# Installing

### Pre-requirements

You must have installed

- [node (version >16.13)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

### Steps

#### **For projects (WIP - when published)**

1. Run `npm install hedera-stable-coin-sdk`. To install the dependency.
2. Import and use the SDK.

#### **For development**

1. Clone the repo and open a terminal in the root folder
2. Run `node install.js`. To install all the dependencies and links.
3. `cd` into `./contracts`
4. Run `npm run build` to build the contracts.
5. `cd` into `./sdk`
6. Make your changes.
7. Run `npm run build` to build the SDK.
8. Import and use the SDK. Or use one of the example projects under `/examples`

### Example (JS)

```JavaScript
// ES5
const { SDK, NetworkMode, HederaNetwork, HederaNetworkEnviroment, EOAccount } = require('hedera-stable-coin-sdk');

// ES6
import { SDK, NetworkMode, HederaNetwork, HederaNetworkEnviroment, EOAccount } from 'hedera-stable-coin-sdk';

const main = async () => {
	// Create instance
	const sdk = new SDK({
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		mode: NetworkMode.HASHPACK,
		options: {
			appMetadata: {
				icon: 'localhost:3000/favicon.ico',
				name: 'test-app',
				description: 'description example for test app',
				url: 'localhost',
			},
			logOptions: {
				level: 'INFO',
			}
	});
	// Init event listener
	const onInit = () => {
		console.log('SDK is initialized');
	};
	// Init the SDK
	await sdk.init({ onInit });
	// Subscribe to events
	sdk.onWalletExtensionFound(() => {
		console.log('Hashpack wallet extension found');
	});
};

try {
	main();
} catch (error) {
	console.error(error);
}

```

### Example (TS)

```TypeScript
import {
	SDK,
	NetworkMode,
	HederaNetwork,
	HederaNetworkEnviroment,
	EOAccount,
	AccountId,
	PrivateKey,
} from 'hedera-stable-coin-sdk';

const main = async (): Promise<void> => {
	// Create instance
	const sdk: SDK = new SDK({
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		mode: NetworkMode.HASHPACK,
		options: {
			appMetadata: {
				icon: 'localhost:3000/favicon.ico',
				name: 'test-app',
				description: 'description example for test app',
				url: 'localhost',
			},
			logOptions: {
				level: 'INFO',
			}
	});
	// Init event listener
	const onInit = (): void => {
		console.log('SDK is initialized');
	};
	// Init the SDK
	await sdk.init({ onInit });
	// Subscribe to events
	sdk.onWalletExtensionFound((): void => {
		console.log('Hashpack wallet extension found');
	});
};

try {
	main();
} catch (error) {
	console.error(error);
}


```

## Before using

The SDK supports both client-side and server-side implementations, keeping in mind that only one `NetworkMode` is currently available for each environment.

On client-side applications, such as React, use `NetworkMode.HASHPACK`.
On server-side applications, such as Node applications, use `NetworkMode.EOA` and supply the credentials.

# Basic Types

## AccountId

An account id on Hedera.

### Fields

- `id`: [string] The account id

### Example

`````Typescript
	const haccount = new HashPackAccount('0.0.1')
`````
## Account
Represents a base account, cannot be used directly. Instead, use EOAccount or HashPackAccount

### Fields
 - `accountId`: [AccountId] The account id
 - `privateKey?`: [PrivateKey](Optional) PrivateKey instance

## EOAccount
Represent an **e**xtenrally **o**wned **a**ccount, a private key must be provided

### Fields
 - `accountId`: [AccountId] The account id
 - `privateKey`: [string] PrivateKey instance

### Example
````Typescript
	const eoa = new EOAccount('0.0.1', new PrivateKey('1234'))
`````

## HashPackAccount

Represents a HashPackAccount.

### Fields

- `accountId`: [AccountId] The account id

### Example

```Typescript
	const haccount = new HashPackAccount('0.0.1')
```

## PrivateKey

A private key, which has the key string and the type of key (ECDSA or ED25519 [default]).

### Fields

- `key`: [string] The private key
- `type`: [PrivateKeyType] The private key type (ECDSA or ED25519 [default])
  - default: ED25519

### Example

```Typescript
	const pk = new PrivateKey('1234')
	const pkECDSA = new PrivateKey('1234' , PrivateKeyType.ECDSA)
```

## PrivateKeyType

A private key type (ECDSA or ED25519 [default]).

### Example

```Typescript

enum PrivateKeyType {
	ECDSA = 'ECDSA',
	ED25519 = 'ED25519',
}

```

## PublicKey

A public key on Hedera.

### Fields

- `key`: The public key

### Example

```Typescript
	const pk = new PublicKey('1234')
```

## ContractId

Represents a contract id on Hedera.

### Fields

- `id`: The contract id

### Example

```Typescript
	const contractId = new ContractId('0.0.1')
```

# Usage

To use the SDK, simply instantiate with the `new` keyword:

```Javascript
	const sdk = new SDK(options);
```

Where `options` can be:

```Javascript
	interface Configuration {
		network: HederaNetwork;
		mode: NetworkMode;
		options?: ConfigurationOptions;
	}

	enum HederaNetworkEnviroment {
		MAIN = 'mainnet',
		PREVIEW = 'previewnet',
		TEST = 'testnet',
		LOCAL = 'local',
	}

	interface ConfigurationOptions {
		appMetadata?: AppMetadata;
		account?: EOAccount;
	}

	enum NetworkMode {
		'EOA' = 'EOA',
		'HASHPACK' = 'HASHPACK',
	}
```

So for example:

```JavaScript
// EOA Account
	const sdk = new SDK({
		mode: NetworkMode.EOA,
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		options: {
			account: new EOAccount({
				accountId: '0.0.1',
				privateKey: '1234',
			}),
			logOptions: {
				level: 'INFO',
				path: './logs'
			}
		},
	});

// Hashpack
	const sdk = new SDK({
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		mode: NetworkMode.HASHPACK,
		options: {
			appMetadata: {
				icon: 'localhost:3000/favicon.ico',
				name: 'test-app',
				description: 'description example for test app',
				url: 'localhost',
			},
		});
```

### **Important**

- When using **EOA** network mode, an `EOAccount` must be specified.
- When using **HASHPACK** network mode, `AppMetadata` must be specified.

The SDK has an `async` function to initialize the SDK, to which you optionally can pass a callback to the initialization event:

```Typescript
	// data
	interface InitilizationData {
		topic: string;
		pairingString: string;
		encryptionKey: string;
		savedPairings: SavedPairingData[];
	}


	new SDK().init({
		onInit: (data) => { // data only populated with Hashpack
			console.log("SDK initialized");
		}
	})
```

## Create Stable Coin

Creates a new stable coin.

**Spec:**

```Typescript
	sdk.createStableCoin = (request: CreateRequest): Promise<StableCoinDetail>
```

**Example:**

```Typescript
	const stableCoin: StableCoinDetail = await sdk.createStableCoin(
		new CreateRequest({
			account: new HashPackAccount("0.0.1"),
			name: "Hedera Stable Coin",
			symbol: "HSC",
			decimals: 6
		})
	);
```

## Get capabilities stable coin

Get a list of the stable coin capabilities

**Spec:**

```Typescript
	enum Capabilities {
		CASH_IN = 'Cash in',
		CASH_IN_HTS = 'Cash in hts',
		DETAILS = 'Details',
		BALANCE = 'Balance',
		BURN = 'Burn',
		BURN_HTS = 'Burn hts',
		WIPE = 'Wipe',
		WIPE_HTS = 'Wipe hts',
		RESCUE = 'Rescue',
		ROLE_MANAGEMENT = 'Role management',
		PAUSE = 'Pause',
	}

	sdk.getCapabilitiesStableCoin() = (id: string, publicKey: string) : Capabilities[]
```

**Example:**

```Typescript
	const stableCoins: StableCoinList[] = await sdk.getCapabilitiesStableCoin(
		'0.0.1',
		'0x1234'
	)
```

## Get stable coin list

Gets a list of the stable coins (id and symbol) managed by an account.

**Spec:**

```Typescript

	interface StableCoinList {
		symbol: string;
		id: string;
	}

	sdk.getListStableCoin = (request: GetListStableCoinRequest): Promise<StableCoinList[]>
```

**Example:**

```Typescript
	const stableCoins: StableCoinList[] = await sdk.getListStableCoin(
		new GetListStableCoinRequest({
			account:{
				accountId:'0.0.123'
			},
		})
	)
```

## Get Stable Coin

Gets the details of a stable coin.

**Spec:**

```Typescript
	sdk.getStableCoinDetails = (request: GetStableCoinDetailsRequest): Promise<StableCoinDetail>
```

**Example:**

```Typescript
	const stableCoin: StableCoinDetail = await sdk.getStableCoinDetails(
		new GetStableCoinDetailsRequest({
			id: "0.0.21345",
		})
	)
```

## Get Balance Of

Gets the balance of tokens of an account.

**Spec:**

```Typescript
	sdk.getBalanceOf = (request: GetAccountBalanceRequest): Promise<string>
```

**Example:**

```Typescript
	const balance: string | null = await sdk.getBalanceOf(
		new GetAccountBalanceRequest({
			proxyContractId: "0.0.1",
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.2",
			tokenId: "0.0.3"
		})
	)
```

## Cash in

Cash in tokens into a stable coin.

**Spec:**

```Typescript
	sdk.cashIn = (request: CashInRequest): Promise<bool>
```

**Example:**

```Typescript
	const res: bool = await sdk.cashIn(
		new CashInRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			amount: "10",
			proxyContractId: "0.0.1",
			targetId: "0.0.2",
			tokenId: "0.0.3",
		})
	)
```

## Cash out

Cash out tokens of a stable coin.

**Spec:**

```Typescript
	sdk.cashOut = (request: CashOutStableCoinRequest): Promise<bool>
```

**Example:**

```Typescript
	const res: bool = await sdk.cashOut(
		new CashOutStableCoinRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			amount: "10",
			proxyContractId: "0.0.1",
			targetId: "0.0.2",
			tokenId: "0.0.3",
		})
	)
```

## Associate token

Associate a stable coin to an account.

**Spec:**

```Typescript
	sdk.associateToken = (request: AssociateTokenRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.associateToken(
		new AssociateTokenRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			proxyContractId: "0.0.1",
		})
	)
```

## Wipe tokens

Wipes tokens of a stable coin

**Spec:**

```Typescript
	sdk.wipe = (request: WipeRequest): Promise<bool>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.wipe(
		new WipeRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			amount: "10.42",
			proxyContractId:"0.0.1",
			targetId: "0.0.3",
			tokenId: "0.0.4",
		})
	)
```

## Rescue tokens

Rescue tokens from a stable coin.

**Spec:**

```Typescript
	sdk.rescue = (request: RescueRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.rescue(
		new RescueRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			proxyContractId: "0.0.1",
			tokenId: "0.0.4",
			amount: "10.42",
		})
	)
```

## Supplier allowance

Get the supplier allowance amount for an account.

**Spec:**

```Typescript
	sdk.supplierAllowance = (request: CheckCashInLimitRequest): Promise<string>
```

**Example:**

```Typescript
	const res: string = await sdk.supplierAllowance(
		new CheckCashInLimitRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
			tokenId: "0.0.2"
		})
	)
```

## Reset supplier allowance

Resets the allowance of a supplier.

**Spec:**

```Typescript
	sdk.resetSupplierAllowance = (request: ResetCashInLimitRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.resetSupplierAllowance(
		new ResetCashInLimitRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
		})
	)
```

## Increase supplier allowance

Increases the allowance of a supplier.

**Spec:**

```Typescript
	sdk.increaseSupplierAllowance = (request: IncreaseCashInLimitRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.increaseSupplierAllowance(
		new IncreaseCashInLimitRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId:"0.0.3",
			proxyContractId:"0.0.1",
			tokenId: "0.0.2"
			amount: "10.42",
		})
	)
```

## Decrease supplier allowance

Decreases the allowance of a supplier.

**Spec:**

```Typescript
	sdk.decreaseSupplierAllowance = (request: DecreaseCashInLimitRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.decreaseSupplierAllowance(
		new DecreaseCashInLimitRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId:"0.0.3",
			proxyContractId:"0.0.1",
			tokenId: "0.0.2"
			amount: "10.42",
		})
	)
```

## Is supplier allowance limited

Checks if the supplier account passed has it's allowance limited.

**Spec:**

```Typescript
	sdk.isLimitedSupplierAllowance = (request: CheckCashInRoleRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.isLimitedSupplierAllowance(
		new CheckCashInRoleRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
		})
	)
```

## Is supplier allowance unlimited

Checks if the supplier account passed has it's allowance unlimited.

**Spec:**

```Typescript
	sdk.isUnlimitedSupplierAllowance = (request: CheckCashInRoleRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.isUnlimitedSupplierAllowance(
		new CheckCashInRoleRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
		})
	)
```

## Grant Role

Grants an account a role in a stable coin.

**Spec:**

```Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSE_ROLE,
		FREEZE_ROLE
	}

	sdk.grantRole = (request: GrantRoleRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.grantRole(
		new GrantRoleRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
			tokenId: "0.0.2"
			role: StableCoinRole.CASHIN_ROLE,
			amount: "10.42"
		})
	)

	const res: Uint8Array = await sdk.grantRole(
		new GrantRoleRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
			tokenId: "0.0.2"
			role: StableCoinRole.WIPE_ROLE
		})
	)
```

## Revoke Role

Revokes an account's role in a stable coin.

**Spec:**

```Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSE_ROLE,
		FREEZE_ROLE
	}

	sdk.revokeRole = (request: RevokeRoleRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.revokeRole(
		new RevokeRoleRequest({
			account: {
				accountId:"0.0.123",
				privateKey:{
					key:"",
					type:""
				},
			},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
			tokenId: "0.0.2"
			role: StableCoinRole.CASHIN_ROLE,
		})
	)
```

## Has role

Checks if an account has a certain role on the stable coin.

**Spec:**

```Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSE_ROLE,
		FREEZE_ROLE
	}

	sdk.hasRole = (request: HasRoleRequest): Promise<Uint8Array>
```

**Example:**

```Typescript
	const res: Uint8Array = await sdk.hasRole(
		new HasRoleRequest({
			account: {
					accountId:"0.0.123",
					privateKey:{
						key:"",
						type:""
					},
				},
			targetId: "0.0.3",
			proxyContractId: "0.0.1",
			tokenId: "0.0.2"
			role: StableCoinRole.WIPE_ROLE,
		})
	)
```

## Get account info

Get the account info

**Spec:**

```Typescript
	interface IAccountWithKeyRequestModel {
		account: Account;
	}

	interface AccountInfo {
		account?:string,
		accountEvmAddress?:string,
		publicKey?:PublicKey,
	}

	sdk.getAccountInfo = (request: IAccountWithKeyRequestModel): Promise<AccountInfo>
```

**Example:**

```Typescript
	const res: AccountInfo = await sdk.getAccountInfo(
		{
			account:{
				accountId:"0.0.1234"
			}
		}
	)
```

## Get roles

Get the role of an account passed

**Spec:**

```Typescript
	sdk.getRoles = (request: GetRolesRequest): Promise<string[]>
```

**Example:**

```Typescript
	const res: string[] = await sdk.getRoles(
		new GetRolesRequest({
			account:{
				accountId:"0.0.1234"
			},
			targetId:"0.0.2",
			proxyContractId:"0.0.1",
			tokenId: "0.0.3"
		})
	);
```

## Check string is valid address

Checks if a string is a valid Hedera address.

**Spec:**

```Typescript
	sdk.checkIsAddress = (str?: string): boolean;
```

**Example:**

```Typescript
	const isAddress: boolean = sdk.checkIsAddress("0.0.1"); // true
	const isNotAddress: boolean = sdk.checkIsAddress("1234"); // false
```

## Public key from private key

Gets the public key of a private key.

**Spec:**

```Typescript
	sdk.getPublicKey = (str?: string): string;
```

**Example:**

```Typescript
	const publicKey: string = sdk.getPublicKey("1234");
```

## Hashpack

### Utilities

#### Get Availability Extension

Check if the Hashpack extension is available

```Typescript
	const isAvailable: bool = sdk.getAvailabilityExtension();
```

#### Get HashConnect Conection Status

Get the HashConncet conection

```Typescript
	enum HashConnectConnectionState {
		Connecting = "Connecting",
		Connected = "Connected",
		Disconnected = "Disconnected",
		Paired = "Paired"
	}

	const status: HashConnectConnectionState = sdk.gethashConnectConectionStatus();
```

#### Get Init Data

```Typescript
	const status: InitializationData = sdk.getInitData();
```

#### Disconect Haspack

Disconect Hashpack

```Typescript
	sdk.disconectHaspack();
```

#### Connect Wallet

```Typescript
	const provider: IProvider = sdk.connectWallet();
```

### Events

You can setup callbacks to events from the Hashpack provider:

```typescript

	public onInit(listener: (data: InitializationData) => void): void

	public onWalletExtensionFound(listener: () => void): void

	public onWalletConnectionChanged(
		listener: (state: HashConnectConnectionState) => void,
	): void

	public onWalletPaired(
		listener: (data: HashConnectTypes.SavedPairingData) => void,
	): void

	public onWalletAcknowledgeMessageEvent(
		listener: (state: AcknowledgeMessage) => void,
	): void

```

For example:

```typescript
const sdk: SDK = await(new SDK().init());
sdk.onWalletPaired((data: HashConnectTypes.SavedPairingData) => {
  console.log('New wallet is paired on network ' + data.network);
});
```

The following events are supported:

- **OnInit:** Is emitted when the SDK has finished initialization.

```typescript
interface InitilizationData {
  topic: string;
  pairingString: string;
  encryptionKey: string;
  savedPairings: SavedPairingData[];
}
```

- **OnWalletExtensionFound:** Is emitted when the Hashpack extension is found.
- **OnWalletConnectionChanged:** Is emitted when the connection changes. The new state is passed.

```typescript
enum HashConnectConnectionState {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Paired = 'Paired',
}
```

- **OnWalletPaired:** Is emitted when a wallet is paired in the extension.

```typescript
interface SavedPairingData {
  metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
  topic: string;
  encryptionKey?: string;
  network: string;
  origin?: string;
  accountIds: string[];
  lastUsed: number;
}
```

- **OnWalletAcknowledgeMessageEvent**: Is emitted when an interaction is acknoledged in the extension.

```typescript
interface Acknowledge {
  topic: string;
  id?: string;
  origin?: string;
  result: boolean;
  msg_id: string;
}
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
