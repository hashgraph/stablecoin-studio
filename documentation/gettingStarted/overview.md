---
id: overview
title: "Getting Started - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# Overview

Stablecoin Studio is an open-source toolkit for issuing and managing stablecoins on the **Hedera** network. Each stablecoin is a **decorator** around a standard Hedera Token: the token lives on the Hedera Token Service (HTS) for speed and low fees, while smart contracts add compliance and governance logic on top.

---

## What You Can Do

| Capability | Description |
| --- | --- |
| **Issue stablecoins** | Deploy a configured stablecoin in a single transaction via the factory contract |
| **Control supply** | Mint (cash-in) and burn tokens with separated roles |
| **Enforce compliance** | Grant/revoke KYC, freeze accounts, wipe balances, pause transfers |
| **Prove reserves** | Link to a Chainlink-compatible data feed that attests the backing reserve |
| **Coordinate multisig** | Require multiple key holders to approve sensitive operations |
| **Upgrade logic** | Push new rules to every stablecoin at once through the centralized resolver |

---

## Architecture at a Glance

The project is composed of five modules working as a vertical stack:

- **Smart Contracts** — On-chain rules using a diamond proxy pattern with a centralized resolver (Factory, Resolver, Facets).
- **SDK** — TypeScript library following hexagonal architecture with DDD and CQS. The programmatic entry point for all operations.
- **Backend** — NestJS REST API for multisignature transaction coordination (optional for single-key accounts).
- **CLI** — Terminal interface supporting every SDK operation, with an interactive wizard mode.
- **Web DApp** — React application providing a visual interface for the full stablecoin lifecycle.

---

## How a Stablecoin Works

1. The **StableCoinFactory** deploys a ResolverProxy, links it to the BusinessLogicResolver, creates an HTS token, and applies initial configuration — all in one transaction.
2. Every call to the stablecoin routes through the proxy to the correct **facet** (modular contract): minting, burning, freezing, KYC, pausing, rescuing, reserves, roles.
3. The **BusinessLogicResolver** maps function selectors to facet addresses. Updating the resolver upgrades logic for all stablecoins at once.

---

## Roles

| Role | Permissions |
| --- | --- |
| **Admin** | Full management: configuration, role assignment, upgrades |
| **Cash-in** | Mint new tokens (with optional supply allowance) |
| **Burn** | Burn tokens from the treasury |
| **Wipe** | Burn tokens from any account (compliance) |
| **Pause** | Pause/unpause all transfers globally |
| **Freeze** | Freeze/unfreeze individual accounts |
| **KYC** | Grant/revoke KYC status |
| **Rescue** | Recover tokens and HBAR from treasury |
| **Delete** | Permanently delete the token (irreversible) |
