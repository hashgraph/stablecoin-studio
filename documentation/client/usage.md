---
id: usage
title: "📋 Usage"
sidebar_label: "Usage"
---

# CLI Interactive Flow

The CLI operates through an interactive menu system. After selecting an account, you will enter the **Main Menu**.

## 📋 Main Menu Options

### 1. Create a New Stablecoin
Guided process to deploy a new token. You can configure:
- **Details**: Name, Symbol, Decimals.
- **Supply**: Initial supply and Maximum supply.
- **Key Management**: Decide if the Smart Contract or a specific account will hold keys for:
  - *Admin, Pause, Wipe, Freeze, Supply, Fee Schedule, KYC.*
- **Advanced Features**: 
  - Enable/Disable KYC.
  - Add Custom Fees (Fixed or Fractional).
  - Configure **Proof of Reserve** (direct or through a data feed).

### 2. Manage Imported Tokens
Allows you to add stablecoins that were created by other accounts or tools to your local management list.

### 3. Operate with Stablecoin
Once a token is selected, you can perform:
- **Cash in**: Mint new tokens (checked against Proof of Reserve if enabled).
- **Burn/Wipe**: Destroy tokens from treasury or other accounts.
- **Rescue**: Retrieve HBAR or tokens accidentally sent to the treasury.
- **Management**: Change roles, freeze/unfreeze accounts, or update KYC status.
- **Danger Zone**: Pause/Unpause or **Delete** the token.

### 4. List Stablecoins
A quick view of all stablecoins associated with your current configuration.

### 5. Multi-Signature Transactions
If using a multi-sig account, this menu allows you to:
- **List** pending transactions.
- **Sign** transactions with your local key.
- **Send** transactions to the network once the threshold is met.

### 6. Configuration (Sub-menu)
Manage your environment without restarting:
- Switch Mirror Nodes or JSON-RPC Relays.
- Update Factory/Resolver IDs.
- Configure or remove the Backend connection.