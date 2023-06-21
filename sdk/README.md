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
- [Installation](#installation)
		- [Prerequisites](#prerequisites)
		- [Steps](#steps)
			- [**For projects (WIP - when published)**](#for-projects-wip---when-published)
			- [**For development**](#for-development)
- [Build](#build)
- [Quick Start](#quick-start)
	- [Initialization](#initialization)
	- [Connect SDK](#connect-sdk)
	- [Wallet Events](#wallet-events)
- [Usage](#usage)
	- [About Operations Execution](#about-operations-execution)
	- [StableCoin](#stablecoin)
		- [Create](#create)
		- [Creates a simple stable coin, with all keys set to the Smart Contracts](#creates-a-simple-stable-coin-with-all-keys-set-to-the-smart-contracts)
		- [Creates a simple stable coin, with all keys set to the admin's public key](#creates-a-simple-stable-coin-with-all-keys-set-to-the-admins-public-key)
		- [Creates a simple stable coin, with all keys set to none](#creates-a-simple-stable-coin-with-all-keys-set-to-none)
		- [GetInfo](#getinfo)
		- [GetBalanceOf](#getbalanceof)
		- [GetBalanceOfHBAR](#getbalanceofhbar)
		- [Associate](#associate)
		- [isAccountAssociated](#isaccountassociated)
		- [CashIn](#cashin)
		- [Burn](#burn)
		- [Rescue](#rescue)
		- [Rescue HBAR](#rescue-hbar)
		- [Wipe](#wipe)
		- [Pause](#pause)
		- [Unpause](#unpause)
		- [Freeze](#freeze)
		- [Unfreeze](#unfreeze)
		- [GrantKYC](#grantkyc)
		- [RevokeKYC](#revokekyc)
		- [IsAccountKYCGranted](#isaccountkycgranted)
		- [Transfers](#transfers)
		- [Update](#update)
		- [Delete](#delete)
		- [GetReserveAddress](#getreserveaddress)
		- [UpdateReserveAddress](#updatereserveaddress)
		- [Capabilities](#capabilities)
	- [Proxy](#proxy)
		- [GetProxyConfig](#getproxyconfig)
		- [ChangeProxyOwner](#changeproxyowner)
		- [UpgradeImplementation](#upgradeimplementation)
		- [GetFactoryProxyConfig](#getfactoryproxyconfig)
		- [UpgradeFactoryImplementation](#upgradefactoryimplementation)
		- [ChangeFactoryProxyOwner](#changefactoryproxyowner)
	- [Network](#network)
		- [Connect](#connect)
		- [Disconnect](#disconnect)
		- [Init](#init)
		- [SetNetwork](#setnetwork)
		- [GetNetwork](#getnetwork)
		- [IsNetworkRecognized](#isnetworkrecognized)
		- [SetConfig](#setconfig)
		- [GetFactoryAddress](#getfactoryaddress)
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
		- [GetAccountsWithRoles](#getaccountswithroles)
		- [GetAllowance](#getallowance)
		- [ResetAllowance](#resetallowance)
		- [IncreaseAllowance](#increaseallowance)
		- [DecreaseAllowance](#decreaseallowance)
		- [IsLimited](#islimited)
		- [IsUnlimited](#isunlimited)
	- [Reserve Data Feed](#reserve-data-feed)
		- [Get Reserve Amount](#get-reserve-amount)
		- [Update Reserve Amount](#update-reserve-amount)
	- [Factory](#factory)
		- [GetHederaTokenManagerList](#gethederatokenmanagerlist)
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

This project provides a SDK to manage Hedera tokens throughout their lifecycle.

This project is based on hybrid tokens, that is, it uses smart contracts that communicate with Hedera to interact with native tokens. It provides functionalities to use in server mode, as well as for web integration (currently supporting HashPack and Metamask).

For more information about the deployed contracts you can consult them in this project - [Contracts](../contracts).

If you want to see a server side implementation you can see it in this project - [Standalone](../cli).

If you want to see an example of a React web app you can see it in this project - [Web](../web).

# Installation

### Prerequisites

You will need the following supporting tools/frameworks installed:

- [node (version >16.17)](https://nodejs.org/en/about/)
- [npm](https://www.npmjs.com/)

### Steps

#### **For projects (WIP - when published)**

1. Run `npm install @hashgraph-dev/stablecoin-npm-sdk` to install the dependency from NPM.
2. Import and use the SDK.

#### **For development**

To use this project in development mode you must follow the steps indicated in the following section [Build](#Build).

# Build

1. Clone the repo and open a terminal in the root folder.
2. Run `node install.js`. To install all the dependencies and links.
3. `cd` into `./contracts`.
4. Run `npm run compile` to compile the contracts.
5. Run `npm run build` to build the contracts.
6. `cd` into `./sdk`.
7. Make your changes.
8. Run `npm run build` to build the SDK.
9. Import and use the SDK. Or use one of the example projects under `/examples`.

# Quick Start
## Initialization

Before using the SDK we need to execute the `Network.init` function and specify network details:

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

In the configuration, you can also specify the factory contract address that will be invoked when creating a stable coin.
```Typescript
const init = await Network.init(
	new InitializationRequest({
		network: 'testnet',
		configuration: {
			factoryAddress: '0.0.0'
		},
	}),
);
```
## Connect SDK
The next step would be to connect to the network. Currently, 3 types of connections are offered: Client (a Hedera account configured in an application configuration file), MetaMask and HashPack. These 3 connection types are in the SupportedWallets enum.

```Typescript
export enum SupportedWallets {
	METAMASK = 'Metamask',
	HASHPACK = 'HashPack',
	CLIENT = 'Client',
}
```
In addition to this we have to specify the accountId and private key for the Client, while HashPack and MetaMask do not require an account in the request. 

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

MetaMask Example

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

This section explains all the operations offered by this SDK.

## About Operations Execution

Before explaining all operations exposed by the SDK, is important to understand how some of these operations are going to be performed.
When creating a stable coin, a set of keys (wipe key, pause key, freeze key, etc...) must be provided in order to create the stable coin token. Each of these keys will control, first of all, if the operation related with the key can be performed or not (if the token wipe key is not set, the wipe operation can not be performed), but, if a key is provided, depending on its value the operation could be performed through the stable coin smart contract or through the Hedera SDK:

1. If the token key corresponds to a Hedera account public key, the operation can only be performed by the Hedera account owning this public key, and only through the Hedera SDK.
2. If the token key corresponds to the stable coin smart contract administrator key, the operation can only be performed through the smart contract, so whoever calls the smart contract can perform the operation. To prevent anyone from performing certain operations roles are used. When the need for a role is indicated in an operation's description, this is only when the related key of the stable coin token is configured to be the smart contract admin key.

## StableCoin
The following operations represent most of the operations that can be performed using a stable coin. Some of them can be performed through the stable coin smart contract or through the Hedera SDK depending on the token configuration explained above.

### Create
Creates a new stable coin. You must use `Network.connect` first with a `SupportedWallet`.

**Spec:**

```Typescript
	interface CreateRequest {
		name: string;
		symbol: string;
		decimals: number | string;
		initialSupply?: string;
		maxSupply?: string;
		freezeDefault?: boolean;
		freezeKey?: RequestPublicKey;
		KYCKey?: RequestPublicKey;		
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyType?: TokenSupplyType;
		feeScheduleKey?: RequestPublicKey;
		stableCoinFactory: string;
		hederaTokenManager: string;
		reserveAddress?: string;
		reserveInitialAmount?: string;
		createReserve: boolean;
		grantKYCToOriginalSender?: boolean;		
		burnRoleAccount?: string | undefined;
		wipeRoleAccount?: string | undefined;
		rescueRoleAccount?: string | undefined;
		pauseRoleAccount?: string | undefined;
		freezeRoleAccount?: string | undefined;
		deleteRoleAccount?: string | undefined;
		kycRoleAccount?: string | undefined;
		cashInRoleAccount?: string | undefined;
		cashInRoleAllowance?: string | undefined;
		metadata?: string | undefined;
	}

	StableCoin.create = (request: CreateRequest): Promise<StableCoinViewModel>
```

**Example:**
### Creates a simple stable coin, with all keys set to the Smart Contracts

This delegates access to features to the smart contract, and enables the usage of roles so multiple accounts can have the same role. The accounts to which the roles are granted can be set in this operation or later on, once the stable coin was created.

```Typescript
	import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest,
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			name: 'Hedera Stable Coin',
			symbol: 'HSC',
			decimals: 6,
			kycKey: Account.NullPublicKey,
			wipeKey: Account.NullPublicKey,
			pauseKey: Account.NullPublicKey,
			adminKey: Account.NullPublicKey,
			freezeKey: Account.NullPublicKey,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
			metadata: 'metadata'
		})
	);
```

### Creates a simple stable coin, with all keys set to the admin's public key

By specifying the public key of an account, we can set the stable coin's keys to be the admin's enabling all features through the Hedera Token Service. In this scenario, only one account could be in charge of one or several operations, but is not possible to multiple accounts to be in charge of one operation.

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
			name: 'Hedera Stable Coin',
			symbol: 'HSC',
			decimals: 6,
			kycKey: publicKey,
			wipeKey: publicKey,
			pauseKey: publicKey,
			adminKey: publicKey,
			freezeKey: publicKey,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false,
			metadata: 'metadata'
		})
	);
```

### Creates a simple stable coin, with all keys set to none
 
By not setting any of the keys, the stable coin will have the corresponding features disabled and the keys set to none.

```Typescript
	import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest,
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const stableCoin: StableCoinViewModel = await StableCoin.create(
		new CreateRequest({
			name: 'Hedera Stable Coin',
			symbol: 'HSC',
			decimals: 6,
			hederaTokenManager: HederaTokenManagerAddressTestnet,
			stableCoinFactory: FactoryAddressTestnet,
			createReserve: false
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
			id: '0.0.1'
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
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
	result.toString()
	result.decimals
```

### GetBalanceOfHBAR
Gets the balance of HBARs for an account.

**Spec:**

```Typescript
	StableCoin.getBalanceOfHBAR = (request: GetAccountBalanceHBARRequest): Promise<Balance>
	
	type Balance = {
		value: BigDecimal
	}
```

**Example:**

```Typescript
	const result: Balance = await StableCoin.getBalanceOfHBAR(
		new GetAccountBalanceHBARRequest({
			treasuryAccountId: '0.0.1'
		})
	);
	result.toString()
	result.decimals
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
			account: new HashPackAccount('0.0.1')
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
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```


### CashIn
Mints tokens and then transfers to an account. The operating account must have the supplier role.

**Spec:**

```Typescript
	StableCoin.cashIn = (request: CashInRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.cashIn(
		new CashInRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2',
			amount: '1234'
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
			tokenId: '0.0.1',
			amount: '1234'
		})
	);
```


### Rescue
Transfers an amount of tokens existing in the treasury account to the account that invokes the operation. The operating account must have the rescue role.

**Spec:**

```Typescript
	StableCoin.rescue = (request: RescueRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.rescue(
		new RescueRequest({
			tokenId: '0.0.1',
			amount: '1234'
		})
	);
```

### Rescue HBAR
Transfers an amount of HBARs existing in the treasury account to the account that invokes the operation. The operating account must have the rescue role.

**Spec:**

```Typescript
	StableCoin.rescueHBAR = (request: RescueHBARRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.rescueHBAR(
		new RescueHBARRequest({
			tokenId: '0.0.1',
			amount: '1234'
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
			tokenId: '0.0.1',
			targetId: '0.0.2',
			amount: '1234'
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
			tokenId: '0.0.1'
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
			tokenId: '0.0.1'
		})
	);
```

### Freeze
Prevents transfer of a stable coin to/from an account. The operating account must have the freeze role.

**Spec:**

```Typescript
	StableCoin.freeze = (request: FreezeRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.freeze(
		new FreezeRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```

### Unfreeze
Enables transfer of a stable coin to/from an account. The operating account must have the freeze role.

**Spec:**

```Typescript
	StableCoin.unFreeze = (request: FreezeRequest): Promise<boolean>
```

**Example:**

```Typescript
	await StableCoin.unFreeze(
		new FreezeRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```

### GrantKYC
Grants KYC to an account. If a Token has KYC enabled, only accounts with KYC can operate it. The operating account must have the KYC role.

**Spec:**

```Typescript
	StableCoin.grantKyc(request: KYCRequest): Promise<boolean>
```

**Example:**

```Typescript
	const result: boolean = await StableCoin.grantKyc(
		new KYCRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```

### RevokeKYC
Revokes KYC from an account. If a Token has KYC enabled, only accounts with KYC can operate it. The operating account must have the KYC role.

**Spec:**

```Typescript
	StableCoin.revokeKyc(request: KYCRequest): Promise<boolean> 
```

**Example:**

```Typescript
	await StableCoin.revokeKyc(
		new KYCRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```

### IsAccountKYCGranted
Checks if an account has the KYC granted.

**Spec:**

```Typescript
	StableCoin.isAccountKYCGranted(request: KYCRequest): Promise<boolean> 
```

**Example:**

```Typescript
	await StableCoin.isAccountKYCGranted(
		new KYCRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);
```

### Transfers
Transfer tokens from an account to up to 9 accounts. This operation is always performed through the Hedera SDK.

**Spec:**

```Typescript
	StableCoin.transfers(request: TransfersRequest): Promise<boolean> 
```

**Example:**

```Typescript
	await StableCoin.transfers(
		new TransfersRequest({
			targetIds: ['0.0.1', '0.0.2', '0.0.3'],
			amounts: ['1', '2', '3'],
			tokenId: '0.0.4',
			targetId: '0.0.5'
		})
	);
```

### Update
Updates certain properties of a token. The operating account must have the admin role.

**Spec:**

```Typescript
	interface UpdateRequest {
		tokenId: string;
		name?: string;
		symbol?: string;
		autoRenewPeriod?: string;
		expirationTimestamp?: string;
		freezeKey?: RequestPublicKey;
		kycKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		feeScheduleKey?: RequestPublicKey;
		metadata?: string | undefined;
	}

	StableCoin.update(request: UpdateRequest): Promise<boolean> 
```

**Example:**

```Typescript
import {
		FactoryAddressTestnet,
		HederaTokenManagerAddressTestnet,
		Account,
		CreateRequest
	} from '@hashgraph-dev/stablecoin-npm-sdk';
	const privateKey: RequestPrivateKey = {
		key: 'someKey',
		type: 'ED25519'
	};
	const reqAccount: RequestAccount = {
		accountId: '0.0.1',
		privateKey: privateKey
	};
	const req: GetPublicKeyRequest = new GetPublicKeyRequest({
		account: reqAccount
	});
	const publicKey = Account.getPublicKey(req);
	await StableCoin.update(
		new UpdateRequest({
			tokenId: '0.0.1',
			name: 'new token name',
			symbol: 'new token symbol',
			autoRenewPeriod: '7776000',
			expirationTimestamp: '1684318075000',
			freezeKey: publicKey,
			kycKey: publicKey,
			wipeKey: publicKey,
			pauseKey: publicKey,
			feeScheduleKey: publicKey,
			metadata: 'new metadata'
		})
	);
```


### Delete
Deletes a stable coin. **Important** this operation is not reversible. The operating account must have the admin role.

**Spec:**

```Typescript
	StableCoin.delete = (request: DeleteRequest): Promise<boolean>
```

**Example:**

```Typescript
	await StableCoin.delete(
		new DeleteRequest({
			tokenId: '0.0.1',
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
			tokenId: '0.0.1',
		})
	);	
```

### UpdateReserveAddress
Updates the contract reserve address.

**Spec:**

```Typescript
	StableCoin.updateReserveAddress = (request: UpdateReserveAddressRequest,): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await StableCoin.updateReserveAddress(
		new GetReserveAddressRequest({
			tokenId: '0.0.1',
			reserveAddress: '0.0.54445787'
		})
	);	
```

### Capabilities
Get capabilities for an account for a stable coin. Each capability determines the type of operation that can be performed (cash in, burn, wipe, etc...) and on whether it should be done via the smart contract for the stable coin (proxyAddress in the `coin: StableCoin` attribute) or through the Hedera Token Service. 

See the spec below for all the attributes you can get from the request.

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
		RESCUE_HBAR = 'Rescue_HBAR'
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
			  accountId: "0.0.1"
			},
			tokenId: "0.0.2"
		})
	);
```


## Proxy
The following functions allow the user to both get information and execute operations regarding the stable coin proxy contract.

### GetProxyConfig
Gets the configuration about the stable coin proxy: the **HederaTokenManager** contract implementation address and the proxy admin account that allows to change the previous implementation.

**Spec:**

```Typescript
	Proxy.getProxyConfig(request: GetProxyConfigRequest): Promise<ProxyConfigurationViewModel>;

```

**Example:**

```Typescript
	const result: ProxyConfigurationViewModel = await Proxy.getProxyConfig(
		new GetProxyConfigRequest({
			tokenId: '0.0.1',
		})
	);	
```

### ChangeProxyOwner
Changes the **HederaTokenManager** contract proxy admin owner.

**Spec:**

```Typescript
	Proxy.changeProxyOwner(request: ChangeProxyOwnerRequest): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await Proxy.changeProxyOwner(
		new ChangeProxyOwnerRequest({
			tokenId: '0.0.1',
			targetId: '0.0.2'
		})
	);	
```

### UpgradeImplementation
Updates the **HederaTokenManager** contract implementation address.

**Spec:**

```Typescript
	Proxy.upgradeImplementation(request: UpgradeImplementationRequest): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await Proxy.upgradeImplementation(
		new UpgradeImplementationRequest({
			tokenId: '0.0.1',
			implementationAddress: '0.0.2'
		})
	);	
```

### GetFactoryProxyConfig
Gets the factory implementation contract address and the factory proxy owner account.

**Spec:**

```Typescript
	Proxy.getFactoryProxyConfig(request: GetFactoryProxyConfigRequest): Promise<ProxyConfigurationViewModel>;

```

**Example:**

```Typescript
	const result: ProxyConfigurationViewModel = await Proxy.getFactoryProxyConfig(
		new GetFactoryProxyConfigRequest({
			factoryId: '0.0.1'
		})
	);	
```

### UpgradeFactoryImplementation
Upgrades the factory with a new factory implementation contract. Only the owner of the factory proxy can perform this action.

**Spec:**

```Typescript
	Proxy.upgradeFactoryImplementation(request: UpgradeFactoryImplementationRequest): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await Proxy.upgradeFactoryImplementation(
		new UpgradeFactoryImplementationRequest({
			factoryId: '0.0.1',
			implementationAddress: '0.0.2'
		})
	);	
```

### ChangeFactoryProxyOwner
Changes the owner of the factory proxy. Only the owner of the factory proxy can perform this action.

**Spec:**

```Typescript
	Proxy.changeFactoryProxyOwner(request: ChangeFactoryProxyOwnerRequest): Promise<boolean>;

```

**Example:**

```Typescript
	const result: boolean = await Proxy.changeFactoryProxyOwner(
		new ChangeFactoryProxyOwnerRequest({
			factoryId: '0.0.1',
			targetId: '0.0.2'
		})
	);	
```

## Network

### Connect
Establishes the connection to work with an existing Hedera account in a wallet in a certain Hedera network, also setting the mirror node and JSON-RPC-Relay services to use in the connection.

**Spec:**
	
	
```Typescript
	Network.connect(req: ConnectRequest): Promise<InitializationData>;
```

**Example:**

```Typescript
	await Network.connect(
		new ConnectRequest({
        	network: 'testnet',
			mirrorNode: {
				name: 'mirrorNode', 
				baseUrl: 'https://testnet.mirrornode.hedera.com/'
			},
			rpcNode: {
				name: 'rpcNode', 
				baseUrl: 'https://testnet.hashio.io/api'
			},
        	wallet: SupportedWallets.HASHPACK
      	})
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

### Init
Sets the network and could also set the mirror node and the JSON-RPC-Relay services, the factory smart contract address and register the events, returning supported wallets depending on wheter the SDK was started through a DApp or not.

**Spec:**
	
	
```Typescript
	Network.init(req: InitializationRequest): Promise<SupportedWallets[]>;
```

**Example:**

```Typescript
	await Network.init(
		new InitializationRequest({
			network: 'testnet',
			mirrorNode: {
				name: 'mirrorNode', 
				baseUrl: 'https://testnet.mirrornode.hedera.com/'
			},
			rpcNode: {
				name: 'rpcNode', 
				baseUrl: 'https://testnet.hashio.io/api'
			},			
			configuration: {
				factoryAddress: '0.0.1'
			}
		})
	);
```

### SetNetwork
Configures a Hedera network, setting some properties like environment and the mirror node and JSON-RPC-Relay services, and also, and optionally, the list of consensus nodes.

**Spec:**
	
	
```Typescript
	Network.setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
```

**Example:**

```Typescript
	await Network.setNetwork(
		new SetNetworkRequest({
			enviroment: 'testnet',
			mirrorNode: 'https://testnet.mirrornode.hedera.com/',
			rpcNode: 'https://testnet.hashio.io/api',
			consensusNodes: []
		})
	);
```

### GetNetwork
Gets the Hedera network you are currently working in.

**Spec:**
	
	
```Typescript
	Network.getNetwork(): string;
```

**Example:**

```Typescript
	Network.getNetwork();
```

### IsNetworkRecognized
Checks if the Hedera network you are currently working in is an existing Hedera network.

**Spec:**
	
	
```Typescript
	Network.isNetworkRecognized(): boolean;
```

**Example:**

```Typescript
	Network.isNetworkRecognized();
```

### SetConfig
Sets the factory smart contract address in the configuration object.

**Spec:**
	
	
```Typescript
	Network.setConfig(req: SetNetworkRequest): Promise<ConfigResponse>;
```

**Example:**

```Typescript
	await Network.setConfig(
		new SetConfigurationRequest({
			factoryAddress: '0.0.1'
		})
	);
```

### GetFactoryAddress
Gets the factory smart contract address.

**Spec:**
	
	
```Typescript
	Network.getFactoryAddress(): string;
```

**Example:**

```Typescript
	Network.getFactoryAddress();
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
			account: '0.0.1';
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
			account: '0.0.1';
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
			account: '0.0.1';
		})
	);
```

## Role
Roles allow Hedera accounts to perform certain operations on a stable coin through the smart contracts. Operations that can be performed through Hedera SDK, due to the token configuration, do not need any role to be assigned. The management of roles can only be performed by a Hedera account having the admin role.

### HasRole
Checks if an account has a specific role for a stable coin.

**Spec:**
		
```Typescript
	Role.hasRole(request: HasRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.hasRole(
		new HasRoleRequest({
			tokenId: '0.0.1',
			targetId: '0.046172343',
			role: StableCoinRole.CASHIN_ROLE
		})
	);
```

### GrantRole
Grants a role to an account for a stable coin. The operating account must have the admin role.

**Spec:**
		
```Typescript
	Role.grantRole(request: GrantRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.grantRole(
		new GrantRoleRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			role: StableCoinRole.CASHIN_ROLE,
		})
	);
```
### GrantMultiRoles
Grants multiple roles to multiple accounts for a stable coin. The operating account must have the admin role.

**Spec:**
		
```Typescript
	Role.grantMultiRoles(request: GrantMultiRolesRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.grantMultiRoles(
		new GrantMultiRolesRequest({
			targetsId: ['0.0.1', '0.0.2']
			tokenId: '0.0.3',
			roles: [StableCoinRole.CASHIN_ROLE, StableCoinRole.BURN_ROLE],
			amounts: [1, 2]
		})
	);
```

### RevokeRole
Revokes a role of an account for a stable coin. The operating account must have the admin role.

**Spec:**	
	
```Typescript
	Role.revokeRole(request: RevokeRoleRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.revokeRole(
		new RevokeRoleRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			role: StableCoinRole.CASHIN_ROLE
		})
	);
```
### RevokeMultiRole
Revokes multiple roles from multiple accounts for a stable coin. The operating account must have the admin role.

**Spec:**	
	
```Typescript
	Role.revokeMultiRoles(request: RevokeMultiRolesRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.revokeMultiRoles(
		new RevokeMultiRolesRequest({
			targetsId: ['0.0.1', '0.0.2']
			tokenId: '0.0.3',
			roles: [StableCoinRole.CASHIN_ROLE,StableCoinRole.BURN_ROLE]
		})
	);
```

### GetRoles
Gets a list of all roles a Hedera account has for a stable coin. 

**Spec:**	
	
```Typescript
	Role.getRoles(request: GetRolesRequest): Promise<string[]>;
```

**Example:**

```Typescript
	await Role.getRoles(
		new GetRolesRequest({
			targetId: '0.0.1',
			tokenId: '0.0.2'
		})
	);
```

### GetAccountsWithRoles
Gets a list of all Hedera accounts that have been granted a certain role.

**Spec:**	
	
```Typescript
	Role.getAccountsWithRoles(request: GetRolesRequest): Promise<string[]>;
```

**Example:**

```Typescript
	await Role.getAccountsWithRoles(
		new GetAccountsWithRolesRequest({
			roleId: StableCoinRole.CASHIN_ROLE,
			tokenId: '0.0.2'
		})
	);
```

### GetAllowance
Gets the supplier allowance (amount of tokens that can be minted by an account) for an account and a stable coin.

**Spec:**	
	
```Typescript
	Role.getAllowance(request: GetSupplierAllowanceRequest): Promise<Balance>;
```

**Example:**

```Typescript
	await Role.getAllowance(
		new GetSupplierAllowanceRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			
		})
	);
```

### ResetAllowance
Sets the supplier allowance to 0 for an account and a stable coin. The operating account must have the admin role.

**Spec:**
	
```Typescript
	Role.resetAllowance(request: ResetSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.resetAllowance(
		new ResetSupplierAllowanceRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2'
			
		})
	);
```

### IncreaseAllowance
Increases the supplier allowance amount for an account and a stable coin. The operating account must have the admin role.

**Spec:**
	
```Typescript
	Role.increaseAllowance(request: IncreaseSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.increaseAllowance(
		new IncreaseSupplierAllowanceRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			amount: 1000
		})
	);
```
 
### DecreaseAllowance
Decreases the supplier allowance amount for an account and a stable coin. The operating account must have the admin role.

**Spec:**	
	
```Typescript
	Role.decreaseAllowance(request: DecreaseSupplierAllowanceRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.decreaseAllowance(
		new DecreaseSupplierAllowanceRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			amount: 1000
		})
	);
```

### IsLimited
Checks if an account has a limited supplier allowance for a stable coin or not.

**Spec:**
	
```Typescript
	Role.isLimited(request: CheckSupplierLimitRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.isLimited(
		new CheckSupplierLimitRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			supplierType: 'limited'
		})
	);
```

### IsUnlimited
Checks if an account has an unlimited supplier allowance for a stable coin or not.

**Spec:**
		
```Typescript
	Role.isUnlimited(request: CheckSupplierLimitRequest): Promise<boolean>;
```

**Example:**

```Typescript
	await Role.isUnlimited(
		new CheckSupplierLimitRequest({
			targetId: '0.0.1'
			tokenId: '0.0.2',
			supplierType: 'unlimited'
		})
	);
```    

## Reserve Data Feed
The following operations are always performed through smart contracts calls, since the reserve data feed is a contract which can be deployed alongside the stable coin.
Getting the reserve amount can be performed by anyone while updating this amount can only be performed by accounts with the appropriate role.

### Get Reserve Amount
Gets the reserve amount for a stable coin.

**Spec:**

```Typescript
	ReserveDataFeed.getReserveAmount = (request: GetReserveAmountRequest): Promise<Balance>;
```

**Example:**

```Typescript
	const balance:Balance = await ReserveDataFeed.getReserveAmount(
		new GetReserveAmountRequest({
			tokenId: "0.0.1"
		})
	);
```

### Update Reserve Amount
Updates the reserve amount for a stable coin. The operating account must have the admin role.

**Spec:**

```Typescript
	ReserveDataFeed.updateReserveAmount = (request: UpdateReserveAmountRequest): Promise<boolean>
```

**Example:**

```Typescript
	const balance:boolean = await ReserveDataFeed.updateReserveAmount(
		new UpdateReserveAmountRequest({
			reserveAddress: '0.0.1',
			reserveAmount: 1
		})		
	);
```

## Factory
The following operations are always performed through smart contracts calls.

### GetHederaTokenManagerList
Get a list of HederaTokenManager smart contract addresses stored in the factory.

**Spec:**

```Typescript
	Factory.getHederaTokenManagerList = (request: GetTokenManagerListRequest): Promise<ContractId[]>;
```
**Example**
```Typescript
	const list = await Factory.getHederaTokenManagerList(
			new GetTokenManagerListRequest({ 
				factoryId: '0.0.1' 
			})
		);
```

## Common
The SDK class is exported. This static class enables the log level and application metadata to be set at any point in your code, just import it and change the values.

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
		level: 'ERROR', // or 'WARN', 'INFO', 'HTTP', 'VERBOSE', 'DEBUG', 'SILLY'
		transports: new Console(),
	};
```

# Testing

### Jest

The project uses Jest for testing. To execute the tests, simply run `npm run test` in the terminal, this will output the coverage as well.

# Typescript

Typescript 4.7 or higher is highly recommended to work with the SDK.

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
