---
id: overview
title: "SDK - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# SDK Overview

The **Stablecoin Studio SDK** is the core TypeScript library for issuing, managing, and operating stablecoins on Hedera. It provides a high-level abstraction over the Hedera Token Service (HTS) and the Stablecoin Studio smart contracts.

---

## Core Methods (Write Operations)

These methods execute transactions that modify the blockchain state. They require specific roles assigned to the signer's address.

All write operations return a `TransactionResult` object containing:
- **`success`** (`boolean`) — whether the transaction succeeded
- **`transactionId`** (`string | undefined`) — the Hedera transaction ID

```typescript
const result = await StableCoin.burn(request);
if (result.success) {
  console.log(`Transaction ID: ${result.transactionId}`);
}
```

| Method | Main Parameters | Description | Required Roles |
| :--- | :--- | :--- | :--- |
| `createStableCoin(req)` | `name, symbol, decimals` | Deploys a new instance via Factory | None (Owner) |
| `mint(req)` | `address, amount` | Mints new tokens to a target account | `CASHIN_ROLE` |
| `burn(req)` | `amount` | Burns tokens from the treasury | `BURN_ROLE` |
| `wipe(req)` | `address, amount` | Removes tokens from an account for compliance | `WIPE_ROLE` |
| `transfer(req)` | `address, amount` | Sends tokens to another address | None |
| `freeze(req)` | `address` | Blocks transfers for a specific account | `FREEZE_ROLE` |
| `unfreeze(req)` | `address` | Unblocks a previously frozen account | `FREEZE_ROLE` |
| `grantKyc(req)` | `address` | Marks an account as verified | `KYC_ROLE` |
| `revokeKyc(req)` | `address` | Revokes verification status | `KYC_ROLE` |
| `pause()` | `-` | Halts all operations (emergency) | `PAUSE_ROLE` |
| `unpause()` | `-` | Resumes contract operations | `PAUSE_ROLE` |
| `rescue(req)` | `token, address, amount` | Recovers assets sent to the contract by mistake | `RESCUE_ROLE` |
| `grantRole(req)` | `role, address` | Assigns a role to an account | `DEFAULT_ADMIN_ROLE` |
| `revokeRole(req)` | `role, address` | Revokes a role | `DEFAULT_ADMIN_ROLE` |

---

## Query Methods (Read Operations)

State queries with no gas cost.

| Method | Return | Description |
| :--- | :--- | :--- |
| `getBalance(address)` | `BigNumber` | Token balance of an address |
| `totalSupply()` | `BigNumber` | Total tokens in circulation |
| `isFrozen(address)` | `boolean` | Checks if an account is blocked |
| `isKycPassed(address)` | `boolean` | Confirms if the account has KYC |

---

## Access Control (Roles)

- **`CASHIN_ROLE`**: Token minting
- **`BURN_ROLE`**: Token destruction
- **`WIPE_ROLE`**: Compliance management
- **`FREEZE_ROLE`**: Account blocking
- **`PAUSE_ROLE`**: Emergency pause
- **`DEFAULT_ADMIN_ROLE`**: Master administrator

> The transaction issuer must have the corresponding role or the operation will fail.

---

## External Wallet Support

The SDK supports external wallet integrations where the private key is **not** passed to the SDK. Instead, the SDK serializes transactions and returns them for signing by an external system (e.g., Fireblocks, DFNS, AWS KMS, or any custodial solution).

Two wallet modes are available:

| Wallet | Description |
| :--- | :--- |
| `EXTERNAL_HEDERA` | For native Hedera Token Service (HTS) operations. Returns hex-encoded serialized Hedera transactions. |
| `EXTERNAL_EVM` | For EVM-compatible operations. Returns unsigned EVM transaction data for signing with ethers or similar libraries. |

### Connection

```typescript
import { Network, ConnectRequest, SupportedWallets } from "@hashgraph/stablecoin-npm-sdk";

await Network.connect(
  new ConnectRequest({
    account: { accountId: "0.0.12345" }, // Only account ID — no private key
    network: "testnet",
    mirrorNode: { baseUrl: "https://testnet.mirrornode.hedera.com" },
    rpcNode: { baseUrl: "https://testnet.hashio.io/api" },
    wallet: SupportedWallets.EXTERNAL_HEDERA,
    externalWalletSettings: {
      validStartOffsetMinutes: 0,
    },
  })
);
```

### Build Methods

Every write operation has a corresponding `build*` method that returns the raw serialized transaction without executing it. This is useful for external signing workflows or for inspecting transactions before submission.

| Method | Description |
| :--- | :--- |
| `StableCoin.buildCashIn(req)` | Serialize a mint transaction |
| `StableCoin.buildBurn(req)` | Serialize a burn transaction |
| `StableCoin.buildWipe(req)` | Serialize a wipe transaction |
| `StableCoin.buildRescue(req)` | Serialize a token rescue transaction |
| `StableCoin.buildRescueHBAR(req)` | Serialize an HBAR rescue transaction |
| `StableCoin.buildPause(req)` | Serialize a pause transaction |
| `StableCoin.buildFreeze(req)` | Serialize a freeze transaction |
| `StableCoin.buildTransfers(req)` | Serialize a transfer transaction |

All build methods return a `SerializedTransactionData` object:

```typescript
interface SerializedTransactionData {
  serializedTransaction: string;  // Hex-encoded transaction bytes
  metadata: {
    transactionType: string;      // e.g., "ContractExecuteTransaction"
    description: string;          // Human-readable operation description
    requiredSigners: string[];    // Account IDs that must sign
  };
}
```

```typescript
const data = await StableCoin.buildCashIn(request);
console.log(data.serializedTransaction);       // Raw bytes to sign externally
console.log(data.metadata.requiredSigners);    // Who needs to sign
```

### Transaction Flow

1. Call a `build*` method (e.g., `StableCoin.buildBurn(request)`)
2. The SDK builds and serializes the transaction but does **not** sign it
3. The result includes the unsigned transaction bytes, transaction type, description, and required signers
4. Your application signs the transaction externally and submits it to the network
