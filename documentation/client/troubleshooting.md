---
id: troubleshooting
title: "🔍 Troubleshooting"
sidebar_label: "Troubleshooting"
---

# Troubleshooting

Solutions to common issues encountered while using the Stable Coin Studio CLI.

## Common Errors

### 1. `Invalid Private Key`
**Problem**: The CLI fails to sign transactions.
**Solution**: Ensure your `OPERATOR_KEY` is an **ECDSA** key. Legacy ED25519 keys may not be supported for all smart contract operations in this version.

### 2. `INSUFFICIENT_TX_FEE`
**Problem**: Transaction fails due to low HBAR balance.
**Solution**: Deploying stablecoins involves contract creation, which is more expensive than standard transfers. Top up your operator account.

### 3. `Global Command Not Found`
**Problem**: Running `scs` returns a "command not found" error.
**Solution**: Ensure you ran `npm link` within the `cli` directory. If on Linux/macOS, you might need `sudo npm link`.

## 🛠️ Debugging
To see detailed logs and stack traces, enable debug mode:
```bash
DEBUG=true scs stablecoin create ...
```