---
id: commands
title: "⌨️ Scripting & Commands Reference"
sidebar_label: "⌨️ Scripting & Commands Reference"
---

# ⌨️ Scripting & Commands Reference

The CLI uses a hierarchical command structure: `scs <category> <action> [options]`.

## Stablecoin Management

### `create`
Deploys a new stablecoin smart contract.
```bash
scs stablecoin create --name "MyToken" --symbol "MTK" --decimals 6
```

### `mint`
Increases the token supply and transfers it to a target account.
```bash
scs stablecoin mint --amount 100 --target 0.0.XXXX --token 0.0.YYYY
```

## Global Options

| Flag | Shortcut | Description |
| :--- | :--- | :--- |
| `--help` | `-h` | Show help for any command. |
| `--version` | `-v` | Display the current CLI version. |
| `--network` | `-n` | Temporarily override the configured network. |

---

## 📖 Use Case Example
```bash
# Set network context
scs config set-network testnet

# Deploy your first Stablecoin
scs stablecoin create --name "Stable Euro" --symbol "SEUR"
```