# 💻 Developer & API Reference

## 🛠️ Stablecoin SDK API Reference
The `@hashgraph/stablecoin-sdk` is the core library for programmatic management.

### Static Methods
- `Stablecoin.get(tokenId)`: Connects to an existing token.
- `Stablecoin.create(params)`: Deploys HTS token + Smart Contract.
- `Stablecoin.list(options)`: Lists all stablecoins associated with the operator.

### Instance Methods
| Method | Description |
| :--- | :--- |
| `mint(amount)` | Creates new units to the treasury. |
| `burn(amount)` | Destroys tokens from the treasury. |
| `wipe(amount, account)` | Removes tokens from a user (Compliance). |
| `freeze(account)` | Blocks transfers for a specific account. |
| `unfreeze(account)` | Re-enables transfers for an account. |
| `rescue(amount)` | Recovers tokens from the contract address. |

### Role Management API
```typescript
await stablecoin.assignRole({
    role: StablecoinRole.CASHIER,
    account: "0.0.XXXXXX"
});
```

## 🖥️ CLI Usage
- `stablecoin create`: CLI Wizard to deploy a new stablecoin.
- `stablecoin list`: List all coins managed by your operator.

## 🛡️ Security Audits
All Smart Contracts have been audited by **CertiK**. Reports are available in `contracts/audits/`.

[⬅️ Back to Home](../README.md)
