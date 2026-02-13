---
id: quick-start
title: "Getting Started - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

Get your first stablecoin running on Hedera testnet in 5 minutes.

---

## System Requirements

- **Node.js** v18.16.0 or higher (LTS recommended)
- **Docker** (required for running the local Mirror Node)

---

## 1. Create a Hedera Testnet Account

1. Go to the [Hedera Developer Portal](https://portal.hedera.com/).
2. Create a **Testnet Account**.
3. Copy your `Account ID` (e.g., `0.0.12345`) and your **Hex Private Key**. The SDK requires the Hex format, not DER.

---

## 2. Clone and Install

```bash
git clone https://github.com/hashgraph/stablecoin-studio.git
cd stablecoin-studio
npm install
```

---

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit the following fields:
- `OPERATOR_ID`: Your Account ID
- `OPERATOR_KEY`: Your Hexadecimal Private Key
- `NETWORK`: `testnet`

---

## 4. Build Modules

Modules must be built in order — contracts first, then SDK, then CLI/Web:

```bash
npm run build:contracts
npm run build:sdk
npm run build:cli    # or npm run build:web
```

---

## 5. Create Your First Stablecoin

Build and start the Web DApp:

```bash
npm run build:web
cd web
npm run start
```

Open [http://localhost:3000](http://localhost:3000), connect your wallet (HashPack or Blade), and use the **"New Coin"** wizard to deploy your first stablecoin on testnet.

For a detailed walkthrough of the creation wizard, see the [Web Usage guide](../web/usage.md).

---

## Next Steps

- [Web Quick Start](../web/quick-start.md) — Full Web DApp setup and configuration
- [Usage](./usage.md) — Roles, operations, and SDK/CLI quick reference
- [Standards](./standards.md) — HIPs and compliance mapping
