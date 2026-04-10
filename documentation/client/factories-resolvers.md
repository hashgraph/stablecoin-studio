---
id: factories-resolvers
title: "🏭 Factories & Resolvers"
sidebar_label: "🏭 Factories & Resolvers"
---

# 🏭 Factories & Resolvers

The "Resolver" logic is a core part of the CLI. Instead of hardcoding addresses, the CLI queries a versioning contract or an internal map to ensure that your commands are always sent to the correct version of the Stablecoin Studio protocol.

These addresses are updated whenever a new version is released.:

| Contract name   | Address     | Network    |
| :--- | :--- | :--- |
| FactoryAddress  | `0.0.6176922` | **Testnet**    |
| FactoryAddress  | `0.0.XXXXXX`  | **Previewnet** |
| ResolverAddress | `0.0.6176887` | **Testnet**    |
| ResolverAddress | `0.0.XXXXXX`  | **Previewnet** |

---