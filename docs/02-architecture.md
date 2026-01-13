# 🏗️ Smart Contracts & Architecture

The architecture separates token issuance (HTS) from management logic (EVM).

## 1. Factory-Proxy Pattern
- **Factory**: Deploys the stablecoin and its management contract.
- **Proxy (HIP-482)**: A Transparent Proxy that keeps the same Contract ID while allowing logic upgrades.

## 2. Dependency Tree
The contracts rely on industry-standard libraries:
* **OpenZeppelin**: For RBAC and security patterns.
* **Hedera Token Service (HTS) Library**: Allows the Smart Contract to "talk" to the native ledger.

| Contract | Role |
| :--- | :--- |
| `StablecoinFactory.sol` | Entry point for new issuances. |
| `Stablecoin.sol` | Core logic (Mint, Burn, Wipe). |
| `ProxyAdmin.sol` | Manages upgrade rights. |

[⬅️ Back to Home](../README.md)
