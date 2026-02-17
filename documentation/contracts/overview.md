---
id: overview
title: "Smart Contracts - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# Smart Contracts Overview

The smart contracts are the on-chain foundation of Stablecoin Studio. They define every rule that governs a stablecoin: who can mint, who can freeze accounts, how reserves are verified, and how logic can be upgraded.

Each stablecoin is a **decorator** around a standard Hedera Token. The token itself is created through the Hedera Token Service (HTS) for native speed and low fees, while the smart contracts add programmable compliance, role-based access control, and upgradeability on top.

---

## How It Works

When a new stablecoin is created, the **StableCoinFactoryFacet** deploys several contracts and creates an HTS token in a single transaction:

1. A **ResolverProxy** (lightweight diamond clone) is deployed for the stablecoin.
2. The proxy is linked to the **BusinessLogicResolver**, which maps function selectors to the correct facet addresses.
3. An HTS token is created and associated with the proxy.
4. Roles and initial configuration (supply, decimals, reserve, KYC) are applied.

From that point on, every call to the stablecoin is routed through the proxy to the appropriate facet.

---

## Facets

Facets are modular contracts, each responsible for one domain of stablecoin functionality. They are registered in the BusinessLogicResolver and shared across all stablecoins.

| Facet | Responsibility |
| --- | --- |
| **HederaTokenManagerFacet** | Core initialization, ERC-20-like reads (`name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`), token metadata updates |
| **CashInFacet** | Mint new tokens and transfer them to an account (increases total supply) |
| **BurnableFacet** | Burn tokens from the treasury account (decreases total supply) |
| **WipeableFacet** | Burn tokens from any account for compliance enforcement (decreases total supply) |
| **FreezableFacet** | Freeze and unfreeze individual accounts (frozen accounts cannot transact) |
| **KYCFacet** | Grant and revoke KYC status for accounts |
| **PausableFacet** | Pause and unpause all token transfers globally |
| **RescuableFacet** | Recover tokens and HBAR from the treasury to another account |
| **DeletableFacet** | Permanently delete the underlying HTS token (irreversible) |
| **ReserveFacet** | Check reserves before minting, update the reserve data feed address |
| **RolesFacet** | Define and query the roles that can be assigned to a stablecoin |
| **RoleManagementFacet** | Grant and revoke multiple roles to multiple accounts in a single transaction |
| **SupplierAdminFacet** | Manage the cash-in role: assign, remove, set/increase/decrease minting allowance |
| **TokenOwnerFacet** | Store the HTS precompile address and the underlying token address |
| **HoldManagementFacet** | Temporarily lock tokens under an escrow address for secondary market or compliance scenarios |
| **CustomFeesFacet** | Manage custom fee schedules on the token |

---

## Key Contracts

### StableCoinFactoryFacet

The entry point for creating new stablecoins. It orchestrates the full deployment flow (proxy, resolver link, HTS token creation, initial configuration) in a single transaction.

A default factory is deployed and maintained by the project on testnet and mainnet. Users can also deploy their own factory.

### BusinessLogicResolver

The central registry that maps function selectors to facet contract addresses. All stablecoin proxies delegate selector resolution to this contract.

Updating the resolver upgrades the logic for **every stablecoin** that points to it, in a single transaction. Individual stablecoins can opt out by pointing to a different resolver.

### ResolverProxy

A lightweight diamond clone deployed per stablecoin. It receives calls and delegates them to the correct facet by querying the BusinessLogicResolver.

### HederaReserveFacet

Implements the Chainlink AggregatorV3Interface to provide reserve data for a stablecoin. Three modes are supported:

| Mode | Reserve Address | Behavior |
| --- | --- | --- |
| **No reserve** | `0.0.0` (zero address) | Minting is unrestricted |
| **Demo reserve** | Deployed at creation | Admin can update the reserve amount manually |
| **External reserve** | Existing data feed | Reads from a Chainlink-compatible oracle |

---

## Roles

Each stablecoin supports fine-grained, multi-account role assignment:

| Role | What It Controls |
| --- | --- |
| **Admin** | Full management: configuration, role assignment, upgrades |
| **Cash-in** | Mint tokens (with optional supply allowance limit) |
| **Burn** | Burn tokens from the treasury |
| **Wipe** | Burn tokens from any account |
| **Pause** | Pause/unpause all transfers |
| **Freeze** | Freeze/unfreeze individual accounts |
| **KYC** | Grant/revoke KYC for accounts |
| **Rescue** | Recover tokens and HBAR from treasury |
| **Delete** | Delete the underlying token (irreversible) |

---

## HTS Precompile Integration

The contracts interact with the Hedera Token Service through the HTS precompiled smart contract. Two Hedera-provided contracts are used:

- **IHederaTokenService.sol** — Interface to the HTS precompile. All token operations (create, mint, burn, freeze, etc.) go through this interface.
- **HederaResponseCodes.sol** — Response codes returned by HTS operations.

---

## Technologies

- **Solidity** 0.8.16+
- **Hardhat** development environment
- **Node.js** 16+ and npm
- **TypeChain** for generating TypeScript bindings from contract ABIs
