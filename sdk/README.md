<div align="center">

# Hedera JSON RPC Relay

[![SDK - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml)
[![Latest Version](https://img.shields.io/github/v/tag/hashgraph/hedera-accelerator-stablecoin?sort=semver&label=version)](README.md)
[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

# Overview
Hedera supports the creation of tokens and stable coins. This SDK aims to help in deploying, managing and operating with stable coins in the Hedera network.

# Installing

### Pre-requirements

You must have installed

- [node (version >16.13)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

### Steps
1. Run `npm install hedera-stable-coin-sdk`. To install the dependency.
2. Import and use the SDK.

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
- When using **EOA** network mode, an EOAccount must be specified.
- When using **HASHPACK** network mode, AppMetadata must be specified.

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

### Create Stable Coin
Spec:
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

Example:
````Typescript
	const stableCoin: StableCoin = await sdk.createStableCoin({
		accountId: new AccountId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		name: "Hedera Stable Coin",
		symbol: "HSC",
		decimals: 6
	})
````

### Get stable coin list
Spec:
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

Example:
````Typescript
	const stableCoins: IStableCoinList[] = await sdk.getListStableCoin({
		privateKey: new PrivateKey("1234"),
	})
````

### Get Stable Coin
Spec:
````Typescript
	interface IGetStableCoinRequest {
		accountId: AccountId;
	}

	sdk.getStableCoin = (request: IGetStableCoinRequest): Promise<StableCoin> | null
````

Example:
````Typescript
	const stableCoin: StableCoin | null = await sdk.getStableCoin({
		accountId: new AccountId("0.0.1"),
	})
````

### Get Balance Of
Spec:
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

Example:
````Typescript
	const balance: Uint8Array | null = await sdk.getBalanceOf({
		accountId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

### Get Token Name
Spec:
````Typescript
	interface IGetNameStableCoinRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
	}

	sdk.getNameToken = (request: IGetNameStableCoinRequest): Promise<Uint8Array> | null
````

Example:
````Typescript
	const res: Uint8Array = await sdk.getNameToken({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
	})
````

### Cash in
Spec:
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

Example:
````Typescript
	const res: Uint8Array = await sdk.cashIn({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

### Cash out
Spec:
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

Example:
````Typescript
	const res: Uint8Array = await sdk.cashOut({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
		targetId: new AccountId("0.0.2"),
		tokenId: new AccountId("0.0.3")
	})
````

### Associate token
Spec:
````Typescript
	interface IAssociateTokenStableCoinServiceRequestModel {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
	}

	sdk.associateToken = (request: IAssociateTokenStableCoinServiceRequestModel): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.cashOut({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.1"),
	})
````

### Wipe tokens
Spec:
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

Example:
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

### Rescue tokens
Spec:
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

Example:
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

### Grant supplier role
Spec:
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

Example:
````Typescript
	const res: Uint8Array = await sdk.grantSupplierRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

### Revoke supplier role
Spec:
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.revokeSupplierRole = (request: IBasicRequest): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.revokeSupplierRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

### Supplier allowance
Spec:
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.supplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.supplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````


### Is supplier allowance unlimited
Spec:
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.isUnlimitedSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.isUnlimitedSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

### Reset supplier allowance
Spec:
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.resetSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.resetSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

### Increase supplier allowance
Spec:
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

Example:
````Typescript
	const res: Uint8Array = await sdk.increaseSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

### Decrease supplier allowance
Spec:
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

Example:
````Typescript
	const res: Uint8Array = await sdk.decreaseSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		amount: 10.42,
	})
````

### Is supplier allowance limited
Spec:
````Typescript
	interface IBasicRequest {
		proxyContractId: ContractId;
		privateKey: PrivateKey;
		accountId: AccountId;
		targetId: AccountId;
	}

	sdk.isLimitedSupplierAllowance = (request: IBasicRequest): Promise<Uint8Array>
````

Example:
````Typescript
	const res: Uint8Array = await sdk.isLimitedSupplierAllowance({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
	})
````

### Grant Role
Spec:
````Typescript
	enum StableCoinRole {
		SUPPLIER_ROLE,
		WIPE_ROLE,
		ADMIN_SUPPLIER_ROLE,
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

Example:
````Typescript
	const res: Uint8Array = await sdk.grantRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````

### Revoke Role
Spec:
````Typescript
	enum StableCoinRole {
		SUPPLIER_ROLE,
		WIPE_ROLE,
		ADMIN_SUPPLIER_ROLE,
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

Example:
````Typescript
	const res: Uint8Array = await sdk.revokeRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````
### Has role
Spec:
````Typescript
	enum StableCoinRole {
		SUPPLIER_ROLE,
		WIPE_ROLE,
		ADMIN_SUPPLIER_ROLE,
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

Example:
````Typescript
	const res: Uint8Array = await sdk.hasRole({
		proxyContractId: new ContractId("0.0.1"),
		privateKey: new PrivateKey("1234"),
		accountId: new AccountId("0.0.2"),
		targetId: new AccountId("0.0.3"),
		role: StableCoinRole.WIPE_ROLE
	})
````

### Check string is valid address
Spec:
````Typescript
	sdk.checkIsAddress = (str?: string): boolean;
````

Example:
````Typescript
	const isAddress: boolean = sdk.checkIsAddress("0.0.1"); // true
	const isNotAddress: boolean = sdk.checkIsAddress("1234"); // false
````
### Get public key from private key
Spec:
````Typescript
	sdk.getPublicKey = (str?: string): string;
````

Example:
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

- OnInit: Is emitted when the SDK has finished initialization.
````typescript
	interface InitilizationData {
        topic: string;
        pairingString: string;
        encryptionKey: string;
        savedPairings: SavedPairingData[];
    }
````
- OnWalletExtensionFound: Is emitted when the Hashpack extension is found.
- OnWalletConnectionChanged: Is emitted when the connection changes. The new state is passed.
````typescript
	enum HashConnectConnectionState {
		Connecting = "Connecting",
		Connected = "Connected",
		Disconnected = "Disconnected",
		Paired = "Paired"
	}
````
- OnWalletPaired: Is emitted when a wallet is paired in the extension.
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
- OnWalletAcknowledgeMessageEvent: Is emitted when an interaction is acknoledged in the extension.
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
