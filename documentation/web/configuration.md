---
id: configuration
title: "⚙️ Configuration & Manual Setup"
sidebar_label: "⚙️ Configuration & Manual Setup"
---

> **Web UI Documentation**
>
> [🚀 Getting Started](./README.md) • [🏗️ Architecture & Stack](./architecture.md) • [🕹️ Usage & Workflows](./usage.md) • [⚙️ Configuration](./configuration.md) • [🛡️ Security](./security.md)
---

# ⚙️ Configuration

The application is configured via environment variables.

## Environment Variables (`.env`)

Create a `.env` file in the root directory.

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `REACT_APP_NETWORK_TYPE` | The Hedera network to connect to. | `testnet` or `mainnet` |
| `REACT_APP_MIRROR_NODE_URL` | Custom Mirror Node URL (optional). | `https://testnet.mirrornode.hedera.com` |
| `REACT_APP_RPC_URL` | JSON-RPC Relay URL for EVM calls. | *(Provider specific)* |
| `REACT_APP_FACTORY_ADDRESS` | **Crucial**. The Contract ID of the deployed Factory. | `0.0.xxxxx` |

## Theme & Branding

* **Colors:** defined in `tailwind.config.js` or main CSS variables.
* **Logos:** Replace assets in `public/assets/images` to white-label the application.
