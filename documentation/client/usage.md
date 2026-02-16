---
id: usage
title: "CLI - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Usage

The CLI supports both direct commands and an interactive menu system.

---

## Commands

The CLI uses a hierarchical structure: `scs <category> <action> [options]`.

### Stablecoin Management

```bash
scs stablecoin create --name "MyToken" --symbol "MTK" --decimals 6
scs stablecoin mint --amount 100 --target 0.0.XXXX --token 0.0.YYYY
```

### Global Options

| Flag | Shortcut | Description |
| :--- | :--- | :--- |
| `--help` | `-h` | Show help for any command |
| `--version` | `-v` | Display CLI version |
| `--network` | `-n` | Override configured network |

---

## Interactive Menu

Running `npm start` or the wizard launches the interactive menu with these sections:

### 1. Create a New Stablecoin

The wizard walks through token details (name, symbol, decimals), supply management (initial/max supply), key management (admin, KYC, freeze, wipe, supply, fee), and advanced features (proof of reserve, KYC gating).

### 2. Manage Imported Tokens

Manage a stablecoin created elsewhere. You need the Token ID and private keys for the roles you want to exercise.

### 3. Operate with Stablecoin

- **Treasury**: Cash in (mint), burn, wipe, rescue
- **Access Control**: Grant/revoke KYC, freeze/unfreeze, update roles
- **Danger Zone**: Pause token, delete token (irreversible)

### 4. Configuration

Modify mirrors, RPCs, factories, and backend settings without editing files manually.

---

## Advanced Scenarios

### Disaster Recovery

If you lose your `hsca-config.yaml` but have your private key and token ID:

1. Re-install the CLI and run the wizard with your private key.
2. Go to **"Manage Imported Tokens"** and enter the Token ID.
3. The CLI queries Hedera and restores control.

### Key Rotation

To move from a single developer key to multi-sig governance:

1. Create the multi-sig account on Hedera.
2. Go to **"Operate with Stablecoin"** > **"Management"** > **"Update Roles"**.
3. Select the `Admin` role and input the multi-sig account ID.
