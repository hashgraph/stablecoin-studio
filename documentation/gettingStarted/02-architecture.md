# 🏗️ Smart Contracts & SDK Architecture


# 📜 SDK Architecture
TThe Stablecoin Studio SDK is built following **Hexagonal Architecture** (Ports and Adapters) to ensure the business logic remains decoupled from the Hedera network specifics.

## 1. Architectural Patterns
* **Hexagonal Structure**: The core logic (Stablecoin Service) interacts with external "Adapters" (Hedera Network, Mirror Nodes, Wallets) through defined "Ports" (Interfaces).
* **Provider Pattern**: Centralizes network communication (Testnet/Mainnet) and account signing.
* **Factory Pattern**: Used to instantiate the \`Stablecoin\` object from a TokenID or a Deployment request.

## 2. Full API Reference

### Core Methods (\`Stablecoin\` Class)
| Method | Type | Description |
| :--- | :--- | :--- |
| `Stablecoin.get(id)` | Static | Hydrates an instance from an existing Token ID. |
| `Stablecoin.create(args)` | Static | Orchestrates HTS creation and Contract deployment. |
| `mint(amount)` | Instance | Mints new supply to the Treasury account. |
| `burn(amount)` | Instance | Destroys tokens held in Treasury. |
| `wipe(amount, account)` | Instance | Forced removal of tokens (Regulatory Compliance). |
| `freeze(account)` | Instance | Prevents an account from moving tokens. |
| `unfreeze(account)` | Instance | Restores movement capabilities for a frozen account. |
| `grantKyc(account)` | Instance | Flags an account as KYC verified. |
| `revokeKyc(account)` | Instance | Removes KYC verification status from an account. |
| `pause()` | Instance | Halts all token operations (Emergency stop). |
| `unpause()` | Instance | Resumes all token operations. |
| `rescue(token, amount)` | Instance | Recovers assets sent accidentally to the contract. |
| `grantRole(role, account)`| Instance | Assigns a specific RBAC role to an account. |
| `getCapabilities()` | Instance | Returns the RBAC permissions for the current operator. |

### Role Management API
```typescript
await stablecoin.assignRole({
    role: StablecoinRole.CASHIER,
    account: "0.0.XXXX"
});
```

# 📜 Smart Contract Architecture

The system uses a **Hybrid Model**: Native Asset Management (HTS) + Programmable Logic (EVM).

## 1. Patterns & Standards
* **Factory Pattern**: The \`StablecoinFactory.sol\` handles the atomic creation of the HTS token and the management contract.
* **Transparent Proxy ([HIP-482](https://hips.hedera.com/hip/hip-482))**: Allows logic upgrades while maintaining a permanent Contract ID.
* **HTS Integration ([HIP-206](https://hips.hedera.com/hip/hip-206))**: Enables the Smart Contract to control the native ledger directly.

## 2. Dependency Mapping
We leverage the industry-standard **OpenZeppelin** libraries, adapted for the Hedera environment.

| Feature | Stablecoin Studio Implementation | OpenZeppelin Equivalent |
| :--- | :--- | :--- |
| **Logic Upgrade** | [HIP-482 Proxy](https://hips.hedera.com/hip/hip-482) | [TransparentUpgradeableProxy](https://docs.openzeppelin.com/contracts/5.x/api/proxy) |
| **Access Control** | Built-in RBAC via HTS Keys | [AccessControl.sol](https://docs.openzeppelin.com/contracts/5.x/api/access) |
| **Token Logic** | [Native HTS (HIP-17)](https://hips.hedera.com/hip/hip-17) | [ERC-20 Standard](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20) |
| **Metadata** | [HIP-10 JSON Schema](https://hips.hedera.com/hip/hip-10) | [ERC-721 Metadata](https://docs.openzeppelin.com/contracts/5.x/api/token/erc721#IERC721Metadata) |

## 3. Deployment Flow
1. **User** triggers \`Factory.deploy()\`.
2. **Factory** creates a **Native Token (HTS)**.
3. **Factory** deploys a **Proxy** pointing to the **Stablecoin Logic**.
4. **Admin Keys** of the Token are assigned to the **Proxy Contract**.
\`\`\`
[⬅️ Back to Home](../intro.md)
