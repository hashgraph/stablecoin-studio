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
- [Usage](#usage)
		- [**Important**](#important)
	- [Create Stable Coin](#create-stable-coin)
	- [Get stable coin list](#get-stable-coin-list)
	- [Get Stable Coin](#get-stable-coin)
	- [Get Balance Of](#get-balance-of)
	- [Get Token Name](#get-token-name)
	- [Cash in](#cash-in)
	- [Cash out](#cash-out)
	- [Associate token](#associate-token)
	- [Wipe tokens](#wipe-tokens)
	- [Rescue tokens](#rescue-tokens)
	- [Grant supplier role](#grant-supplier-role)
	- [Revoke supplier role](#revoke-supplier-role)
	- [Supplier allowance](#supplier-allowance)
	- [Reset supplier allowance](#reset-supplier-allowance)
	- [Increase supplier allowance](#increase-supplier-allowance)
	- [Decrease supplier allowance](#decrease-supplier-allowance)
	- [Is supplier allowance limited](#is-supplier-allowance-limited)
	- [Is supplier allowance unlimited](#is-supplier-allowance-unlimited)
	- [Grant Role](#grant-role)
	- [Revoke Role](#revoke-role)
	- [Has role](#has-role)
	- [Check string is valid address](#check-string-is-valid-address)
	- [Public key from private key](#public-key-from-private-key)
	- [Hashpack](#hashpack)
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

````JavaScript
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

````

### Example (TS)

````TypeScript
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


````
## Before using
The SDK supports both client-side and server-side implementations, keeping in mind that only one `NetworkMode` is currently available for each environment.

On client-side applications, such as React, use `NetworkMode.HASHPACK`.
On server-side applications, such as Node applications, use `NetworkMode.EOA` and supply the credentials.

# Usage
To use the SDK, simply instantiate with the `new` keyword:

````Javascript
	const sdk = new SDK(options);
````
Where `options` can be:
````Javascript
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
````
So for example:

````JavaScript
// EOA Account
	const sdk = new SDK({
		mode: NetworkMode.EOA,
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		options: {
			account: new EOAccount({
				accountId: '0.0.1',
				privateKey: '1234',
			}),
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
````
### **Important**
- When using **EOA** network mode, an `EOAccount` must be specified.
- When using **HASHPACK** network mode, `AppMetadata` must be specified.

The SDK has an `async` function to initialize the SDK, to which you optionally can pass a callback to the initialization event:
````Typescript
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
````

## Create Stable Coin

Creates a new stable coin.

**Spec:**
````Typescript
	interface ICreateStableCoinRequest {
		accountId: AccountId;
		privateKey: PrivateKey;
		name: string;
		symbol: string;
		decimals: number;
		initialSupply?: bigint;
		maxSupply?: bigint;
		memo?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: PublicKey;
		freezeKey?: PublicKey;
		KYCKey?: PublicKey;
		wipeKey?: PublicKey;
		pauseKey?: PublicKey;
		supplyKey?: PublicKey;
		treasury?: AccountId;
	}

	sdk.createStableCoin = (request: ICreateStableCoinRequest): Promise<StableCoin>
````

**Example:**
````Typescript
	const stableCoin: StableCoin = await sdk.createStableCoin({
		accountId: new AccountId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		name: "Hedera Stable Coin",
		symbol: "HSC",
		decimals: 6
	})
````

## Get stable coin list

Gets a list of the stable coins (id and symbol) managed by an account.

**Spec:**
````Typescript
	interface IGetListStableCoinRequest {
		privateKey: PrivateKey;
	}

	interface IStableCoinList {
		symbol: string;
		id: string;
	}

	sdk.getListStableCoin = (request: IGetListStableCoinRequest): Promise<IStableCoinList[]>
````

**Example:**
````Typescript
	const stableCoins: IStableCoinList[] = await sdk.getListStableCoin({
		privateKey: new PrivateKey("1234"),
	})
````

## Get Stable Coin

Gets the details of a stable coin.

**Spec:**
````Typescript
	interface IGetStableCoinRequest {
		accountId: AccountId;
	}

	sdk.getStableCoin = (request: IGetStableCoinRequest): Promise<StableCoin> | null
````

**Example:**
````Typescript
	const stableCoin: StableCoin | null = await sdk.getStableCoin({
		accountId: new AccountId("0.0.1"),
	})
````

## Get Balance Of

Gets the balance of tokens of an account.

**Spec:**
````Typescript
	interface IGetBalanceStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		tokenId: AccountId;
	}

	sdk.getBalanceOf = (request: IGetBalanceStableCoinRequest): Promise<Uint8Array> | null
````

**Example:**
````Typescript
	const balance: Uint8Array | null = await sdk.getBalanceOf({
		accountId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

## Get Token Name

Gets the token name of a stable coin.

**Spec:**
````Typescript
	interface IGetNameStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
	}

	sdk.getNameToken = (request: IGetNameStableCoinRequest): Promise<Uint8Array> | null
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.getNameToken({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
	})
````

## Cash in

Cash in tokens into a stable coin.

**Spec:**
````Typescript
	interface ICashInStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		tokenId: AccountId;
	}

	sdk.cashIn = (request: ICashInStableCoinServiceRequestModel): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.cashIn({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

## Cash out

Cash out tokens of a stable coin.

**Spec:**
````Typescript
	interface ICashOutStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		tokenId: AccountId;
	}

	sdk.cashOut = (request: ICashOutStableCoinServiceRequestModel): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.cashOut({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

## Associate token

Associate a stable coin to an account.

**Spec:**
````Typescript
	interface IAssociateTokenStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
	}

	sdk.associateToken = (request: IAssociateTokenStableCoinServiceRequestModel): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.cashOut({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
	})
````

## Wipe tokens

Wipes tokens of a stable coin

**Spec:**
````Typescript
	interface IWipeStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		tokenId: AccountId;
		amount: number;
	}

	sdk.wipe = (request: IAssociateTokenStableCoinServiceRequestModel): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.wipe({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		tokenId: new AccountId("0.0.4"),
		amount: 10.42,
	})
````

## Rescue tokens

Rescue tokens from a stable coin.

**Spec:**
````Typescript
	interface IRescueStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		tokenId: AccountId;
		amount: number;
	}

	sdk.rescue = (request: IRescueStableCoinRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.rescue({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		tokenId: new AccountId("0.0.4"),
		amount: 10.42,
	})
````

## Grant supplier role

Grants the supplier role to an account.

**Spec:**
````Typescript
	interface ISupplierRoleStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		amount: number;
	}

	sdk.grantSupplierRole = (request: ISupplierRoleStableCoinServiceRequestModel): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.grantSupplierRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

## Revoke supplier role

Revokes the supplier role to an account.

**Spec:**
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.revokeSupplierRole = (request: IBasicRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.revokeSupplierRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

## Supplier allowance

Sets the supplier allowance for an account.

**Spec:**
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.supplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.supplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````


## Reset supplier allowance

Resets the allowance of a supplier.

**Spec:**
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.resetSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.resetSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

## Increase supplier allowance

Increases the allowance of a supplier.

**Spec:**
````Typescript
	interface IAllowanceRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		amount: number;
	}

	sdk.increaseSupplierAllowance = (request: IAllowanceRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.increaseSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

## Decrease supplier allowance

Decreases the allowance of a supplier.

**Spec:**
````Typescript
	interface IAllowanceRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		amount: number;
	}

	sdk.decreaseSupplierAllowance = (request: IAllowanceRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.decreaseSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

## Is supplier allowance limited

Checks if the supplier account passed has it's allowance limited.

**Spec:**
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.isLimitedSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.isLimitedSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````
## Is supplier allowance unlimited

Decreases the allowance of a supplier.

**Spec:**
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.isUnlimitedSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.isUnlimitedSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

## Grant Role

Grants an account a role in a stable coin.

**Spec:**
````Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSER_ROLE,
	}

	interface IRoleStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		role: StableCoinRole;
		amount?: number;
	}

	sdk.grantRole = (request: IRoleStableCoinRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.grantRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````

## Revoke Role

Revokes an account's role in a stable coin.

**Spec:**
````Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSER_ROLE,
	}

	interface IRoleStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		role: StableCoinRole;
		amount?: number;
	}

	sdk.revokeRole = (request: IRoleStableCoinRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.revokeRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````
## Has role

Checks if an account has a certain role on the stable coin.

**Spec:**
````Typescript
	enum StableCoinRole {
		CASHIN_ROLE,
		BURN_ROLE,
		WIPE_ROLE,
		RESCUE_ROLE,
		PAUSER_ROLE,
	}

	interface IRoleStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
		role: StableCoinRole;
		amount?: number;
	}

	sdk.hasRole = (request: IRoleStableCoinRequest): Promise<Uint8Array>
````

**Example:**
````Typescript
	const res: Uint8Array = await sdk.hasRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````

## Check string is valid address

Checks if a string is a valid Hedera address.

**Spec:**
````Typescript
	sdk.checkIsAddress = (str?: string): boolean;
````

**Example:**
````Typescript
	const isAddress: boolean = sdk.checkIsAddress("0.0.1"); // true
	const isNotAddress: boolean = sdk.checkIsAddress("1234"); // false
````
## Public key from private key

Gets the public key of a private key.

**Spec:**
````Typescript
	sdk.getPublicKey = (str?: string): string;
````

**Example:**
````Typescript
	const publicKey: string = sdk.getPublicKey("1234");
````
## Hashpack

### Events

You can setup callbacks to events from the Hashpack provider:

````typescript

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

````

For example:

````typescript
	const sdk: SDK = await (new SDK().init());
	sdk.onWalletPaired((data: HashConnectTypes.SavedPairingData) => {
		console.log("New wallet is paired on network " + data.network)
	})
````

The following events are supported:

- **OnInit:** Is emitted when the SDK has finished initialization.
````typescript
	interface InitilizationData {
        topic: string;
        pairingString: string;
        encryptionKey: string;
        savedPairings: SavedPairingData[];
    }
````
- **OnWalletExtensionFound:** Is emitted when the Hashpack extension is found.
- **OnWalletConnectionChanged:** Is emitted when the connection changes. The new state is passed.
````typescript
	enum HashConnectConnectionState {
		Connecting = "Connecting",
		Connected = "Connected",
		Disconnected = "Disconnected",
		Paired = "Paired"
	}
````
- **OnWalletPaired:** Is emitted when a wallet is paired in the extension.
````typescript
	interface SavedPairingData {
        metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
        topic: string;
        encryptionKey?: string;
        network: string;
        origin?: string;
        accountIds: string[];
        lastUsed: number;
    }
````
- **OnWalletAcknowledgeMessageEvent**: Is emitted when an interaction is acknoledged in the extension.
````typescript
    interface Acknowledge {
		topic: string;
        id?: string;
        origin?: string;
        result: boolean;
        msg_id: string;
    }
````

# Testing

### Jest

The project uses Jest for testing. To execute the tests, simply run `npm run test` in the terminal, this will output the coverage as well.

# Typescript

Typescript 4.7 or higher is highly reccomended to work with the SDK.

## Tsconfig
### Client side
An example of a tsconfig.json for client-side applications (React):
````json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "allowJs": false,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution":"node",
    "declaration": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "types": ["node", "jest"],
    "resolveJsonModule": true,
  },
  "include": ["src", "svg.d.ts"],
  "exclude": ["node_modules"]
}

````

### Server side
An example of a tsconfig.json for server-side applications (Node):
````json
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

````

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
