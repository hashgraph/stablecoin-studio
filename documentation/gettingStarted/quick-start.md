---
id: quick-start
title: "Getting Started - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

Get your first stablecoin running on Hedera testnet.

---

## System Requirements

- **Node.js** v18.16.0 or higher (LTS recommended)
- **Docker** (required for running the local Mirror Node)

---

## 1. Get a Hedera Account

You need a Hedera account to operate stablecoins.

If you want to run on **testnet**, create a free account at the [Hedera Developer Portal](https://portal.hedera.com/) and copy your `Account ID` (e.g., `0.0.12345`) and **Hex Private Key**. The SDK requires the Hex format, not DER.

For **mainnet**, use your existing Hedera account. Note that mainnet operations incur real HBAR costs.

---

## 2. Clone and Build

Clone the repository and install all dependencies:

```bash
git clone https://github.com/hashgraph/stablecoin-studio.git
cd stablecoin-studio
```

You can either run the automated setup or build manually:

**Option A — Automated setup (recommended):**

```bash
npm run install:all
```

**Option B — Manual build (in order):**

```bash
npm run install:contracts
npm run build:contracts
npm run install:sdk
npm run build:sdk
npm run install:web
npm run build:web
```

---

## 3. Configure and Run the Web DApp

The Web DApp is the recommended way to interact with Stablecoin Studio. Before starting it, configure the environment:

```bash
cd web
cp .env.example .env
```

Edit the `.env` file with the required variables. You can copy the following testnet configuration to get started quickly:

```env
REACT_APP_FACTORIES='[{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.7353542"}]'
REACT_APP_RESOLVERS='[{"Environment":"testnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.7353500"}]'
REACT_APP_MIRROR_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.mirrornode.hedera.com/api/v1/","API_KEY":"","HEADER":""}]'
REACT_APP_RPC_NODE='[{"Environment":"testnet","BASE_URL":"https://testnet.hashio.io/api","API_KEY":"","HEADER":""}]'
```

> The factory and resolver addresses above correspond to the latest version. Check [Deployed Addresses](/references/deployed-addresses) for other versions. For mirror node and RPC node options, see [Hedera Mirror Nodes](https://docs.hedera.com/hedera/core-concepts/mirror-nodes) and [Hedera JSON-RPC Relay](https://docs.hedera.com/hedera/core-concepts/smart-contracts/json-rpc-relay).

For the full list of optional variables (backend, consensus nodes, Hedera WalletConnect, etc.), see the [Web Quick Start](../web/quick-start.md#configuration-env).

Then start the app:

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000), connect your wallet, and use the **"+"** button to deploy your first stablecoin on testnet.

For a detailed walkthrough, see the [Web Usage guide](../web/usage.md).

> You can also use the [CLI](../client/quick-start.md) instead of the Web DApp if you prefer the terminal.

---

## Next Steps

- [Web Quick Start](../web/quick-start.md) — Full Web DApp configuration details
- [CLI Quick Start](../client/quick-start.md) — Terminal-based alternative
- [Usage](./usage.md) — Roles, operations, and SDK/CLI quick reference
- [Standards](./standards.md) — HIPs and compliance mapping
