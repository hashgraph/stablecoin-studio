---
id: usage
title: "🚀 Getting Started & Usagew"
sidebar_label: "🚀 Getting Started & Usage"
---

# 🚀 Getting Started & Usage

This guide covers the fundamental operations you can perform with the Stablecoin Studio SDK.

## 🎬 Initialization

You need to initialize the client with a connection to the Hedera Network.

```typescript
import { Client } from "@hashgraph/sdk";
import { StableCoinClient } from "@hashgraph/stablecoin-npm-sdk";

// 1. Setup the Hedera Client (Testnet)
const hederaClient = Client.forTestnet();
hederaClient.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);

// 2. Initialize the SDK
const sdk = new StableCoinClient(hederaClient);
```

## ⚙️ Managing a Stablecoin

### ✨ Creating a Token
Deploy a new stablecoin with one command. This sets up the Proxy and Factory contracts automatically.

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

### 📈 Cash-In (Minting)
Mint new tokens to a specific address. Requires `CASHIN_ROLE`.

```typescript
await sdk.mint({
  tokenId: "0.0.12345",
  amount: "500.00",
  targetId: "0.0.98765" // Receiver
});
```

### 🔥 Cash-Out (Burning)
Burn tokens to reduce supply. Typically done from the treasury. Requires `BURN_ROLE`.

```typescript
await sdk.burn({
  tokenId: "0.0.12345",
  amount: "100.00"
});
```

### 🛡️ Role Management
Grant capabilities to other accounts for security and compliance.

```typescript
// Grant KYC Role to a compliance officer
await sdk.grantRole({
  tokenId: "0.0.12345",
  targetId: "0.0.55555",
  role: "KYC_ROLE"
});
```
