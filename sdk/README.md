<div align="center">

# Hedera Stable Coin SDK

[![SDK - Test](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml/badge.svg)](https://github.com/hashgraph/hedera-accelerator-stablecoin/actions/workflows/sdk.test.yml)
[![Latest Version](https://img.shields.io/github/v/tag/hashgraph/hedera-accelerator-stablecoin?sort=semver&label=version)](README.md)
[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

# Table of contents
- [Overview](#overview)
- [Installing](#installing)
	- [Pre-requirements](#pre-requirements)
	- [Steps](#steps)
		- [**For projects (WIP - when published)**](#for-projects-wip---when-published)
		- [**For development**](#for-development)
- [Build](#Build)
- [Quick Start](#quickstart)
	- [Initialization](#initialization)
	- [Connect sdk](#connect-sdk)
	- [Wallet Events](#wallet-events)
	- [Getting Account Information](#account-information)
- [Usage](#usage)
	- [**Important**](#important)
	- [StableCoin](#stablecoin)
		- [Create Stable Coin](#create-stable-coin)
		- [Get Info](#get-info)
		- [Cash In](#cash-in)
		- [Burn](#burn)
		- [Rescue](#rescue)
		- [Wipe](#wipe)
		- [Associate](#associate)
		- [Get Balance Of](#get-balance-of)
		- [Capabilities](#capabilities)
		- [Pause](#pause)
		- [Unpause](#unpause)
		- [Delete](#delete)
		- [Freeze](#freeze)
		- [Unfreeze](#unfreeze)
		- [Get Reserve Address](#Get-Reserve-Address)
		- [Update Reserve Address](#Upsate-Reserve-Address)
	- [Network](#network)
		- [Connect](#connect)
		- [Disconnect](#disconnect)
		- [Set Network](#set-network)
	- [Event](#event)
		- [Register](#register)
	- [Account](#account)
		- [Get Public Key](#get-public-key)
		- [List Stable Coins](#list-stable-coins)
		- [Get Account Info](#get-account-info)
	- [Role](#role)
		- [Has Role](#has-role)	
		- [Grant Role](#grant-role)
		- [Revoke Role](#revoke-role)
		- [Get Roles](#get-roles)
		- [Get Allowance](#get-allowance)
		- [Reset Allowance](#reset-allowance)
		- [Increase Allowance](#increase-allowance)
		- [Decrease Allowance](#decrease-allowance)		
		- [Is Allowance Limited](#is-allowance-limited)
		- [Is Allowance Unlimited](#is-allowance-unlimited)
	- [Reserve Data Feed](#reserve-data-feed)
		- [Get Reserve Amount](#get-reserve-amount)	 		
		- [Update Reserve Amount](#update-reserve-amount)	 		
	- [Common](#Common)
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

This project provides an sdk to manage hedera tokens throughout their lifecycle.

This project based on hybrid tokens, that is, it uses Smart Contracts that communicate with hedera to interact with them. It provides functionalities for use in server mode, as well as for web integration (currently supporting Hashpack and Metamask).

For more information about the deployed contracts you can consult them in this project - [Contracts link](../contracts)

If you want to see server side implementation you can see it in this project - [Standalone](../cli)

If you want to see an example of a React web app you can see it in this project - [Web](../web)

# Installing

### Pre-requirements

You must have installed

- [node (version >16.17)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

### Steps

#### **For projects (WIP - when published)**

1. Run `npm install hedera-stable-coin-sdk`. To install the dependency.
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
SDK.log = configurationService.getLogConfiguration();
  await Network.init(
    new InitializationRequest({
    	network: 'Testnet',
    }),
 );
```  

## Connect sdk
The next step would be to connect to the network. Currently 3 types of connections are offered: Client, Metamask and Haspack. These 3 connection types are in the SupportedWallets enum.

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
Hashpack Example

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
Wallets fire events the following events, see [Event.register](#Register) for more info. 

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

## StableCoin

### Create Stable Coin
Creates a new stable coin. You must use Network.connect first with a SupportedWallet.

**Spec:**

```Typescript
	StableCoin.create = (request: CreateRequest): Promise<StableCoinViewModel>
```

**Example:**

```Typescript
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			account: new HashPackAccount("0.0.1"),
			name: "Hedera Stable Coin",
			symbol: "HSC",
			decimals: 6
		})
	);
```

### Get Info
Gets the information of an existing stable coin

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


### Cash In
Mint tokens in a specific stable coin. The operating account must have the supplier role.

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
Burn tokens in a specific stable coin.

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
Rescue tokens in a specific stable coin.

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
Mint tokens in a specific stable coin. The operating account must have the supplier role.

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



### Get balance of
Get balance of tokens for an account of a specific stable coin.

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
### Get Reserve Address
Get contract reserve address .

**Spec:**

```Typescript
	StableCoin.getReserveAddress(request: GetReserveAddressRequest): Promise<string>;

```

**Example:**

```Typescript
	const result: string = await StableCoin.StableCoin(
		new GetReserveAddressRequest({
			tokenId: "0.0.1",
		})
	);
	result // "0.1.255445"
	
```

### Update Reserve Address
Update contract reserve address .

**Spec:**

```Typescript
	StableCoin.updateReserveAddress = (request: UpdateReserveAddressRequest,): Promise<boolean>;

```

**Example:**

```Typescript
	const result: string = await StableCoin.updateReserveAddress(
		new GetReserveAddressRequest({
			tokenId: "0.0.1",
			reserveAddress: "0.0.54445787"
		})
	);
	result // "true"
	
```

### Capabilities
Get capabiltities for an account on a stable coin. Capabilties have a reference of all the details of the stable coin quering to, the list of capabiltities and the account the capabilities belong to. Each capabiltiy determines the type of operation that can be performed (cash in, burn, etc) and on wether it should be done onto the smart contract for the stable coin (proxyAddress in the `coin: StableCoin` attirbute) or through the Hedera Token Service. 

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

### Pause
Pause a stable coin. None of the operations can take while the stable coin is in the paused state.

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
Unpause a stable coin. If the stable coin is not paused it will throw an exception.

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
Freeze an account for a stable coin.

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
Unfreeze an account for a stable coin.

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

### Delete
Delete a stable coin. **Important** this operation is not reversible.

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

## Network

### Connect
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
**Spec:**
	
	
```Typescript
	Network.disconnect(): Promise<boolean>;
```

**Example:**

```Typescript
	await Network.disconnect();
```

### SetNetwork
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
Register for wallet events. All event listeners are optional, just make sure to call it before trying to pair with any wallet, since pairing events can occur right when the page loads and the extension is found, if the wallet was paired previously.

Multiple wallets can emit events, so make sure to filter them by the `wallet` attribute available in all of them indicating which wallet is emitting the event. All wallets supported emit the same events.

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

### GetPublicKey
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

### HasRole
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
**Spec:**
	
	
```Typescript
	Role.grantRole(request: HasRoleRequest): Promise<boolean>;
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

### RevokeRole
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

### GetRoles
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
    
    
   
}

## Reserve Data Feed

### Get Reserve Amount
Get reserve Amount

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
Update reserve Amount

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
## Common
The SDK class is exported. This static class allows to set the log level and application metadata at any point in your code, just import it and change the values.

We use [winston](https://github.com/winstonjs/winston) under the hood for logging, so all transports are exported from the sdk under `LoggerTransports` for you to use. Refer to the [documentation](https://github.com/winstonjs/winston/blob/master/docs/transports.md) for more information on what transports are available.

```Typescript
	import { LoggerTransports, SDK } from 'hedera-stable-coin-sdk';
	
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
