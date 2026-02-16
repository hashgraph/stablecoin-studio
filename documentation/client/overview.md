---
id: overview
title: "CLI - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# CLI Overview

The **Stablecoin Studio CLI** provides a streamlined workflow to create, configure, and operate stablecoins from the terminal. It uses the API exposed by the SDK and serves as both a production tool and a demo of the project's capabilities.

---

## Features

- Interactive wizard for step-by-step stablecoin deployment
- Direct command-line mode for scripting and automation
- Support for self-custodial keys (ED25519, ECDSA), custodial wallets (Dfns, Fireblocks, AWS KMS), and multi-signature accounts
- Configurable network, factory, and resolver addresses

---

## Authentication Modes

| Mode | Description |
| :--- | :--- |
| **Self-Custodial** | ED25519 or ECDSA private keys. Works with Hedera Portal, HashPack, or Blade |
| **Custodial Wallets** | Native support for Dfns, Fireblocks, and AWS KMS |
| **Multi-signature** | Transactions requiring multiple signatures. Requires the [Backend](../backend/overview.md) for signature coordination |

---

## Factories & Resolvers

The CLI queries versioning contracts to route commands to the correct protocol version. Default addresses are updated with each release:

| Contract | Address | Network |
| :--- | :--- | :--- |
| FactoryAddress | `0.0.6176922` | **Testnet** |
| ResolverAddress | `0.0.6176887` | **Testnet** |

Configure these in your `hsca-config.yaml` under the `factories` and `resolvers` sections.
