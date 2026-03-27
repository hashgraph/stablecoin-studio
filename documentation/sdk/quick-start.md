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
npm run build:contracts   # Contracts must be built first
npm run build:sdk
```

---

## Initialization

The SDK supports multiple initialization paths depending on your signing backend.

### Option A: From environment variables (simplest)

Set `HEDERA_NETWORK`, `HEDERA_OPERATOR_ID`, and `HEDERA_PRIVATE_KEY` in your `.env` file, then:

```typescript
import { StableCoinSDK } from "@hashgraph/stablecoin-npm-sdk";

const sdk = StableCoinSDK.fromEnvironment();
```

### Option B: With a Hedera Client

```typescript
import { Client } from "@hashgraph/sdk";
import { StableCoinSDK } from "@hashgraph/stablecoin-npm-sdk";

const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);

const sdk = new StableCoinSDK({
  network: 'testnet',
  signing: { type: 'client', client },
});
```

### Option C: With an EVM Signer (MetaMask, ethers)

```typescript
import { ethers } from 'ethers';
import { StableCoinSDK } from "@hashgraph/stablecoin-npm-sdk";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const sdk = new StableCoinSDK({
  network: 'testnet',
  signing: { type: 'signer', signer },
});
```

---

## Create Your First Stablecoin

```typescript
const result = await sdk.create({
  name: 'Euro Stable',
  symbol: 'EUR-S',
  factoryAddress: '0x...', // Factory contract address
  resolverAddress: '0x...', // Resolver contract address
  signerAddress: '0x...', // Your EVM address
  keys: [
    { keyType: 17n,  publicKey: '0x', isEd25519: false }, // admin + supply
    { keyType: 110n, publicKey: '0x', isEd25519: false }, // kyc + freeze + wipe + fee_schedule + pause
  ],
});

console.log('Proxy address:', result.proxyAddress);
console.log('Token address:', result.tokenAddress);
```

---

## Next Steps

- [Usage](./usage.md) — Minting, burning, role management, and more examples
- [Architecture](./architecture.md) — Pipeline execution engine and signing modes
- [Overview](./overview.md) — Full API reference
