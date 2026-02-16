---
id: usage
title: "Getting Started - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Usage

This page covers the core operations available across the SDK and CLI.

---

## Role & Asset Management

Stablecoin Studio provides fine-grained control over who can perform sensitive operations.

| Role | Responsibility |
| --- | --- |
| **Admin** | Can upgrade contracts and assign roles |
| **Cashier** | Authorized to mint and burn tokens |
| **Compliance** | Can freeze accounts and wipe fraudulent funds |
| **Rescue** | Can recover assets sent to the contract by mistake |

---

## SDK Quick Reference

The `@hashgraph/stablecoin-sdk` is the primary tool for custom integrations.

| Method | Description |
| --- | --- |
| `Stablecoin.get(id)` | Connects to an existing token |
| `Stablecoin.create(args)` | Deploys a new stablecoin |
| `mint(amount)` | Creates new supply to treasury |
| `burn(amount)` | Destroys supply from treasury |
| `wipe(amount, account)` | Force-removes tokens from a user |
| `freeze(account)` | Prevents an account from moving tokens |
| `unfreeze(account)` | Restores movement for a frozen account |
| `grantKyc(account)` | Flags an account as KYC verified |
| `revokeKyc(account)` | Removes KYC verification |
| `pause()` / `unpause()` | Halts/resumes all token operations |
| `rescue(token, amount)` | Recovers assets sent to the contract |
| `grantRole(role, account)` | Assigns a role to an account |
| `getCapabilities()` | Returns permissions for the current operator |

### SDK Code Example

```typescript
const coin = await Stablecoin.get("0.0.xxxx");
if ((await coin.getCapabilities()).canMint) {
    await coin.mint(1000);
}
```

---

## CLI Commands

| Command | Description |
| --- | --- |
| `stablecoin create` | Step-by-step wizard to deploy |
| `stablecoin list` | Shows all tokens you manage |
| `stablecoin manage` | Sub-menu for mint/burn/wipe |

---

## Role Assignment Example

```typescript
await stablecoin.assignRole({
    role: StablecoinRole.CASHIER,
    account: "0.0.XXXX"
});
```
