# 📜 Standards & Compliance

## 🏗️ Hedera Token Standards (HIPs)
* **[HIP-10: Token Metadata](https://hips.hedera.com/hip/hip-10)**: Standard for token metadata.
* **[HIP-206: HTS Smart Contract Integration](https://hips.hedera.com/hip/hip-206)**: Interaction between HTS and EVM.
* **[HIP-482: Transparent Upgradable Proxies](https://hips.hedera.com/hip/hip-482)**: Standard for proxy contracts on Hedera.

## 🔄 OpenZeppelin Equivalents
| Feature | Hedera Implementation | OpenZeppelin Standard |
| :--- | :--- | :--- |
| **Fungible Token** | [HTS Native](https://docs.hedera.com/hedera/core-concepts/token-service) | [ERC-20](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20) |
| **Upgradeability** | [HIP-482 Proxy](https://hips.hedera.com/hip/hip-482) | [TransparentProxy](https://docs.openzeppelin.com/contracts/5.x/api/proxy#TransparentUpgradeableProxy) |
| **Access Control** | Built-in RBAC | [AccessControl](https://docs.openzeppelin.com/contracts/5.x/api/access#AccessControl) |

[⬅️ Back to Home](../README.md)
