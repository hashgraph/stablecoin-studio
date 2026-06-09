---
id: quick-start
title: "SDK - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

Get up and running with the Stablecoin Studio SDK.

---

## Installation

```bash
npm install @hashgraph/stablecoin-npm-sdk
```

Or build from source:

```bash
git clone https://github.com/hashgraph/stablecoin-studio.git
cd stablecoin-studio
npm run install
npm run build:contracts
npm run build:sdk
```

---

## Environment Setup

Create a `.env` file with your Hedera account credentials and deployed contract addresses:

```env
MY_ACCOUNT_ID=0.0.12345
MY_PRIVATE_KEY=302e...
FACTORY_ADDRESS=0x...
RESOLVER_ADDRESS=0x...
```

---

## Initialization

The SDK uses `Network.init()` to configure connectivity and `Network.connect()` to attach an account.

```typescript
import {
  Network,
  InitializationRequest,
  ConnectRequest,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';

const mirrorNodeConfig = {
  name: 'Testnet Mirror Node',
  network: 'testnet',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
  apiKey: '',
  headerName: '',
  selected: true,
};

const rpcNodeConfig = {
  name: 'HashIO',
  network: 'testnet',
  baseUrl: 'https://testnet.hashio.io/api',
  apiKey: '',
  headerName: '',
  selected: true,
};

// 1. Initialize the network
await Network.init(
  new InitializationRequest({
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    configuration: {
      factoryAddress: process.env.FACTORY_ADDRESS!,
      resolverAddress: process.env.RESOLVER_ADDRESS!,
    },
  }),
);

// 2. Connect an account
await Network.connect(
  new ConnectRequest({
    account: {
      accountId: process.env.MY_ACCOUNT_ID!,
      privateKey: {
        key: process.env.MY_PRIVATE_KEY!,
        type: 'ED25519', // or 'ECDSA'
      },
    },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.CLIENT,
  }),
);
```

---

## Create Your First Stablecoin

```typescript
import {
  StableCoin,
  CreateRequest,
  TokenSupplyType,
} from '@hashgraph/stablecoin-npm-sdk';

const accountId = process.env.MY_ACCOUNT_ID!;

const result = await StableCoin.create(
  new CreateRequest({
    name: 'My Stablecoin',
    symbol: 'MSC',
    decimals: 6,
    initialSupply: '1000',
    supplyType: TokenSupplyType.INFINITE,
    createReserve: false,
    grantKYCToOriginalSender: true,
    // Assign all roles to the deploying account
    burnRoleAccount: accountId,
    wipeRoleAccount: accountId,
    rescueRoleAccount: accountId,
    pauseRoleAccount: accountId,
    freezeRoleAccount: accountId,
    deleteRoleAccount: accountId,
    kycRoleAccount: accountId,
    cashInRoleAccount: accountId,
    feeRoleAccount: accountId,
    cashInRoleAllowance: '0',
    proxyOwnerAccount: accountId,
    configId: '0x0000000000000000000000000000000000000000000000000000000000000002',
    configVersion: 1,
  }),
) as { coin: any; reserve: any };

console.log('Token ID:', result.coin.tokenId.toString());
```

---

## Next Steps

- [Usage](./usage.md) — Minting, burning, holds, fees, role management, and more
- [Wallet Adapters](./wallet-adapters.md) — External adapters and multisig signing flows
- [Architecture](./architecture.md) — Connectivity layers and internal design
