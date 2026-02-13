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
