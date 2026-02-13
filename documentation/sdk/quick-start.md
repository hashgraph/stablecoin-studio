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

```typescript
import { Client } from "@hashgraph/sdk";
import { StableCoinClient } from "@hashgraph/stablecoin-npm-sdk";

// 1. Setup the Hedera Client (Testnet)
const hederaClient = Client.forTestnet();
hederaClient.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);

// 2. Initialize the SDK
const sdk = new StableCoinClient(hederaClient);
```

---

## Create Your First Stablecoin

```typescript
const request = {
  name: "Euro Stable",
  symbol: "EUR-S",
  decimals: 2,
  initialSupply: "1000000",
  adminKey: process.env.PUBLIC_KEY
};

const token = await sdk.createStableCoin(request);
console.log("Token created:", token.tokenId);
```

---

## Next Steps

- [Usage](./usage.md) — Minting, burning, role management, and more examples
- [Architecture](./architecture.md) — Connectivity layers and internal design
- [Overview](./overview.md) — Full API reference
