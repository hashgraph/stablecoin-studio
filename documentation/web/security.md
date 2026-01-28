---
id: security
title: "🛡️ Security"
sidebar_label: "🛡️ Security "
---

> **Web UI Documentation**
>
> [🚀 Getting Started](./README.md) • [🏗️ Architecture & Stack](./architecture.md) • [🕹️ Usage & Workflows](./usage.md) • [⚙️ Configuration](./configuration.md) • [🛡️ Security](./security.md)
---

# 🛡️ Security & Best Practices

## Wallet Connection
* **Non-Custodial:** The Web UI **never** asks for or stores your Private Key or Seed Phrase.
* **Signatures:** All transactions must be explicitly approved via the Wallet Extension popup.

## Session Management
* The pairing string for HashConnect is stored in LocalStorage to persist the connection on refresh.
* Clear your browser cache or disconnect via the wallet extension to end the session completely.

## Visual Security (RBAC)
The UI implements "Frontend Guard Rails":
* If your wallet lacks the `ADMIN_ROLE`, the "Settings" tab is hidden.
* If your wallet lacks the `CASHIN_ROLE`, the "Mint" button is disabled.

> ⚠️ **Warning:** Frontend checks are for UX only. The **real security** is enforced on-chain by the Smart Contracts. A user cannot bypass security by modifying the React code, as the Hedera network will reject the transaction.
