# 🏗️ System Architecture

Stablecoin Studio leverages the **Hedera Token Service (HTS)** for high performance (10k+ TPS) and low fees.

[Image of Hedera Token Service ecosystem and Smart Contract integration]

### Core Components
1. **The Factory**: A smart contract that deploys your specific stablecoin instance.
2. **The Proxy**: All stablecoins use the Transparent Proxy Pattern, allowing for logic upgrades while keeping the same Token ID.
3. **The SDK**: A TypeScript wrapper that handles the complexity of Hedera transactions and multi-sig logic.

[⬅️ Back to Home](../README.md)
