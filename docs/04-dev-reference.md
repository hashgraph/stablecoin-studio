# 💻 Developer: SDK & CLI Reference

## 🛠️ SDK API Reference
The `@hashgraph/stablecoin-sdk` is the primary tool for custom integrations.

### Main Methods
| Method | Description |
| :--- | :--- |
| `Stablecoin.get(id)` | Connects to an existing token. |
| `mint(amount)` | Creates new supply to treasury. |
| `burn(amount)` | Destroys supply from treasury. |
| `wipe(amount, account)` | Force-removes tokens from a user. |
| `getCapabilities()` | Returns allowed actions for current operator. |

### SDK Code Example
```typescript
const coin = await Stablecoin.get("0.0.xxxx");
if ((await coin.getCapabilities()).canMint) {
    await coin.mint(1000);
}
```

## 🖥️ CLI Commands
- `stablecoin create`: Step-by-step wizard to deploy.
- `stablecoin list`: Shows all tokens you manage.
- `stablecoin manage`: Sub-menu for Mint/Burn/Wipe.

[⬅️ Back to Home](../README.md)
