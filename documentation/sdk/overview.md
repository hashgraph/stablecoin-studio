---
id: overview
title: "SDK - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# SDK Overview

The **Stablecoin Studio SDK** is the core TypeScript library for issuing, managing, and operating stablecoins on Hedera. It provides a high-level abstraction over the Hedera Token Service (HTS) and the Stablecoin Studio smart contracts, with a pipeline-based execution engine that supports multiple signing backends.

---

## Core Methods (Write Operations)

These methods execute transactions that modify the blockchain state. They require specific roles assigned to the signer's address.

All write operations return an `OperationOutcome` object containing:
- **`success`** (`boolean`) — whether the transaction succeeded
- **`transactionId`** (`string | undefined`) — the Hedera transaction ID

```typescript
const result = await sdk.burn({ contractAddress, amount: '1000000' });
if (result.success) {
  console.log(`Transaction ID: ${result.transactionId}`);
}
```

| Method | Main Parameters | Description | Required Roles |
| :--- | :--- | :--- | :--- |
| `create(req)` | `name, symbol, factoryAddress, resolverAddress` | Deploys a new stablecoin via Factory | None (Owner) |
| `cashIn(req)` | `contractAddress, targetId, amount` | Mints new tokens to a target account | `CASHIN_ROLE` |
| `burn(req)` | `contractAddress, amount` | Burns tokens from the treasury | `BURN_ROLE` |
| `wipe(req)` | `contractAddress, targetId, amount` | Removes tokens from an account for compliance | `WIPE_ROLE` |
| `transfer(req)` | `contractAddress, tokenAddress, fromId, targetId, amount` | Sends tokens to another address | None |
| `freeze(req)` | `contractAddress, targetId` | Blocks transfers for a specific account | `FREEZE_ROLE` |
| `unfreeze(req)` | `contractAddress, targetId` | Unblocks a previously frozen account | `FREEZE_ROLE` |
| `grantKyc(req)` | `contractAddress, targetId` | Marks an account as verified | `KYC_ROLE` |
| `revokeKyc(req)` | `contractAddress, targetId` | Revokes verification status | `KYC_ROLE` |
| `pause(req)` | `contractAddress` | Halts all operations (emergency) | `PAUSE_ROLE` |
| `unpause(req)` | `contractAddress` | Resumes contract operations | `PAUSE_ROLE` |
| `rescue(req)` | `contractAddress, amount` | Recovers tokens sent to the contract by mistake | `RESCUE_ROLE` |
| `rescueHBAR(req)` | `contractAddress, amount` | Recovers HBAR sent to the contract by mistake | `RESCUE_ROLE` |
| `grantRole(req)` | `contractAddress, targetId, role` | Assigns a role to an account | `DEFAULT_ADMIN_ROLE` |
| `revokeRole(req)` | `contractAddress, targetId, role` | Revokes a role | `DEFAULT_ADMIN_ROLE` |
| `delete(req)` | `contractAddress` | Permanently deletes the token | `DELETE_ROLE` |

### Hold Operations

| Method | Main Parameters | Description |
| :--- | :--- | :--- |
| `createHold(req)` | `contractAddress, amount, expirationTimestamp, escrowAddress` | Creates a token hold under escrow |
| `executeHold(req)` | `contractAddress, holdId, tokenHolder, toAddress, amount` | Executes a held amount (partial or full) |
| `releaseHold(req)` | `contractAddress, holdId, tokenHolder, amount` | Releases a hold back to the holder |
| `reclaimHold(req)` | `contractAddress, holdId, tokenHolder` | Reclaims an expired hold |

### Supplier Role Management

| Method | Description |
| :--- | :--- |
| `grantSupplierRole(req)` | Grants cash-in role with a minting allowance |
| `revokeSupplierRole(req)` | Revokes cash-in role |
| `grantUnlimitedSupplierRole(req)` | Grants cash-in role with unlimited minting |
| `increaseAllowance(req)` | Increases a supplier's minting allowance |
| `decreaseAllowance(req)` | Decreases a supplier's minting allowance |
| `resetAllowance(req)` | Resets a supplier's minting allowance to zero |

### Multi-Role Operations

| Method | Description |
| :--- | :--- |
| `grantMultiRoles(req)` | Grants multiple roles to multiple accounts in one transaction |
| `revokeMultiRoles(req)` | Revokes multiple roles from multiple accounts in one transaction |

---

## Query Methods (Read Operations)

State queries executed via JSON-RPC with no gas cost.

| Method | Return Field | Description |
| :--- | :--- | :--- |
| `getBalance(req)` | `balance` | Token balance of an address |
| `getBurnableAmount(req)` | `amount` | Tokens available for burning |
| `getReserveAddress(req)` | `reserveAddress` | Reserve contract address |
| `getReserveAmount(req)` | `amount` | Current reserve amount |
| `hasRole(req)` | `hasRole` | Whether an account has a specific role |
| `getRoles(req)` | `roles` | All roles held by an account |
| `getAccountsWithRole(req)` | `accounts` | All accounts with a specific role |
| `isUnlimited(req)` | `isUnlimited` | Whether a supplier has unlimited minting |
| `getAllowance(req)` | `allowance` | Supplier's current minting allowance |
| `getHeldAmount(req)` | `amount` | Tokens currently held for an account |
| `getHoldCount(req)` | `count` | Number of active holds for an account |
| `getHoldsId(req)` | `holdIds` | Hold IDs for an account |

---

## Access Control (Roles)

- **`CASHIN_ROLE`**: Token minting
- **`BURN_ROLE`**: Token destruction
- **`WIPE_ROLE`**: Compliance management
- **`FREEZE_ROLE`**: Account blocking
- **`PAUSE_ROLE`**: Emergency pause
- **`RESCUE_ROLE`**: Asset recovery
- **`KYC_ROLE`**: Account verification
- **`DELETE_ROLE`**: Token deletion
- **`HOLD_ROLE`**: Hold operations
- **`DEFAULT_ADMIN_ROLE`**: Master administrator

> The transaction issuer must have the corresponding role or the operation will fail.

---

## Signing Modes

The SDK supports multiple signing backends through a unified pipeline. The signing mode is set at initialization and determines how transactions are signed and submitted.

| Mode | Transport | Description |
| :--- | :--- | :--- |
| **Client** | Hedera gRPC | Direct signing with a Hedera Client (operator ID + private key) |
| **Signer** | EVM JSON-RPC | Signing with an ethers Signer (private key or browser wallet like MetaMask) |
| **Hedera External** | Hedera | Serializes transactions for external signing (returns raw bytes) |
| **Hedera External Execute** | Hedera | WalletConnect/HashPack — signs and executes atomically via wallet extension |
| **EVM External** | EVM | Serializes EVM transactions for external signing |
| **Custodial** | Hedera gRPC | Custodial providers (Fireblocks, DFNS, AWS KMS) sign via a callback interface |
| **MultiSig** | Hedera | Serializes transactions for multi-signature coordination via the Backend API |

### Custodial Signing

For custodial wallets (Fireblocks, DFNS, AWS KMS), the SDK accepts a `CustodialSigner` interface:

```typescript
interface CustodialSigner {
  sign(req: { transactionBytes: Uint8Array }): Promise<Uint8Array>;
}
```

The custodial provider signs the raw transaction bytes and the SDK submits the signed transaction to Hedera.

### External Wallet Flow

For external signing modes (`hedera-external`, `evm-external`, `multisig`), the SDK returns the serialized transaction instead of executing it:

1. Call any operation method (e.g., `sdk.cashIn(request)`)
2. The SDK builds and serializes the transaction but does **not** sign or submit it
3. The result includes the unsigned transaction bytes
4. Your application signs the transaction externally and submits it to the network
