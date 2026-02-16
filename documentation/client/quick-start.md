---
id: quick-start
title: "CLI - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

## Prerequisites

- [Node.js](https://nodejs.org/) >= v16.13
- [npm](https://www.npmjs.com/)
- Contracts and SDK must be built first ([see Getting Started](../gettingStarted/quick-start.md))

---

## Installation

**From NPM (official release):**

```bash
npm install -g @hashgraph/stablecoin-npm-cli
```

**From source (local build):**

```bash
cd stablecoin-studio/cli
npm install
```

---

## Starting the CLI

```bash
npm start                # Direct command line
npm run start:wizard     # Interactive wizard
```

---

## Configuration

On first run, the wizard creates a configuration file automatically. To configure manually:

```bash
cp hsca-config.sample.yaml hsca-config.yaml
```

### Key Settings

| Setting | Description |
| :--- | :--- |
| `defaultNetwork` | `testnet`, `previewnet`, or `mainnet` |
| `accounts` | List of operator accounts with keys and type |
| `mirrors` | Mirror node URLs (at least one required) |
| `rpcs` | RPC node URLs (at least one required) |
| `factories` | Factory contract IDs per network |
| `resolvers` | Resolver contract IDs per network |
| `backend.endpoint` | Backend URL (optional, for multi-sig) |
| `logs.level` | `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE` |

### Account Configuration

Each account entry requires:
- **accountId**: Hedera Account ID (e.g., `0.0.12345`)
- **type**: `SELF-CUSTODIAL`, `FIREBLOCKS`, `DFNS`, `AWS-KMS`, or `MULTI-SIGNATURE`
- **network**: Network this account belongs to
- **alias**: Friendly name

For self-custodial accounts, provide `privateKey.key` and `privateKey.type` (ED25519 or ECDSA).

> **Important**: For testing, use a **Testnet** account. Mainnet operations incur real HBAR costs.
