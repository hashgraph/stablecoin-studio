---
id: usage
title: "SDK - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Getting Started & Usage

This guide covers the fundamental operations you can perform with the Stablecoin Studio SDK.

## Initialization

The SDK can be initialized from environment variables or with explicit configuration.

### From environment variables

```bash
# .env file
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.12345
HEDERA_PRIVATE_KEY=0x...
```

```typescript
import { StableCoinSDK } from "@hashgraph/stablecoin-npm-sdk";

const sdk = StableCoinSDK.fromEnvironment();
```

### With explicit configuration

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

## Managing a Stablecoin

### Creating a Token
Deploy a new stablecoin with one command. This sets up the Proxy and Factory contracts automatically.

```typescript
const result = await sdk.create({
  name: 'Euro Stable',
  symbol: 'EUR-S',
  factoryAddress: process.env.FACTORY_ADDRESS,
  resolverAddress: process.env.RESOLVER_ADDRESS,
  signerAddress: '0x...', // Your EVM address
  keys: [
    { keyType: 17n,  publicKey: '0x', isEd25519: false },
    { keyType: 110n, publicKey: '0x', isEd25519: false },
  ],
});
console.log('Proxy:', result.proxyAddress);
```

### Cash-In (Minting)
Mint new tokens to a specific address. Requires `CASHIN_ROLE`.

```typescript
const result = await sdk.cashIn({
  contractAddress: '0x...', // Proxy contract address
  targetId: '0x...', // Receiver EVM address
  amount: '500000000', // Raw amount (with decimals)
});
console.log('Success:', result.success, 'Tx:', result.transactionId);
```

### Cash-Out (Burning)
Burn tokens to reduce supply. Typically done from the treasury. Requires `BURN_ROLE`.

```typescript
const result = await sdk.burn({
  contractAddress: '0x...',
  amount: '100000000',
});
console.log('Success:', result.success, 'Tx:', result.transactionId);
```

### Queries
Read on-chain state without gas cost.

```typescript
// Check balance
const balance = await sdk.getBalance({
  contractAddress: '0x...',
  targetId: '0x...',
});
console.log('Balance:', balance.balance);

// Check roles
const roles = await sdk.getRoles({
  contractAddress: '0x...',
  targetId: '0x...',
});
console.log('Roles:', roles.roles);
```

### Role Management
Grant capabilities to other accounts for security and compliance.

```typescript
// Grant KYC Role to a compliance officer
const result = await sdk.grantRole({
  contractAddress: '0x...',
  targetId: '0x...', // Compliance officer EVM address
  role: '0x...', // Role bytes32
});
console.log('Success:', result.success, 'Tx:', result.transactionId);
```

### Hold Operations
Create and manage token holds for escrow scenarios.

```typescript
// Create a hold
const hold = await sdk.createHold({
  contractAddress: '0x...',
  amount: '100000000',
  expirationTimestamp: (Math.floor(Date.now() / 1000) + 3600).toString(),
  escrowAddress: '0x...',
});

// Execute a hold (partial)
const exec = await sdk.executeHold({
  contractAddress: '0x...',
  holdId: '1',
  tokenHolder: '0x...',
  toAddress: '0x...',
  amount: '50000000',
});
```

### Custodial Signing
For custodial providers (Fireblocks, DFNS, AWS KMS):

```typescript
import { CustodialWalletService, DFNSConfig } from '@hashgraph/hedera-custodians-integration';

const walletService = new CustodialWalletService(new DFNSConfig(/* ... */));

const sdk = new StableCoinSDK({
  network: 'testnet',
  signing: {
    type: 'custodial',
    client, // Hedera Client configured with setOperatorWith()
    custodialSigner: {
      async sign(req) {
        return walletService.signTransaction(new SignatureRequest(req.transactionBytes));
      },
    },
  },
});
```
