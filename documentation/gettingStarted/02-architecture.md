# Smart Contracts & SDK Architecture


# SDK Architecture
The Stablecoin Studio SDK is built following **Hexagonal Architecture** (Ports and Adapters) with DDD and CQS, ensuring the business logic remains decoupled from the Hedera network specifics.

## 1. Architectural Patterns
* **Hexagonal Structure**: The core logic interacts with external "Adapters" (Hedera Network, Mirror Nodes, Wallets) through defined "Ports" (Interfaces).
* **Pipeline Execution**: Transactions flow through a chain of steps (Build, Sign, Submit, Parse, Extract) assembled at initialization based on the signing configuration.
* **Config-Driven Operations**: Operations (pause, cashIn, burn, freeze, etc.) are registered declaratively — adding a new operation requires only a config entry.
* **TransactionOrchestrator**: The central execution engine that routes operations through the pipeline and manages signing configuration.

## 2. API Reference

### Core Methods (`StableCoinSDK` Class)
| Method | Description |
| :--- | :--- |
| `sdk.create(req)` | Deploys a new stablecoin via the Factory contract. |
| `sdk.cashIn(req)` | Mints new tokens to a target account. |
| `sdk.burn(req)` | Burns tokens from the treasury. |
| `sdk.wipe(req)` | Forced removal of tokens (Regulatory Compliance). |
| `sdk.freeze(req)` | Prevents an account from moving tokens. |
| `sdk.unfreeze(req)` | Restores movement capabilities for a frozen account. |
| `sdk.grantKyc(req)` | Flags an account as KYC verified. |
| `sdk.revokeKyc(req)` | Removes KYC verification status from an account. |
| `sdk.pause(req)` | Halts all token operations (Emergency stop). |
| `sdk.unpause(req)` | Resumes all token operations. |
| `sdk.rescue(req)` | Recovers tokens sent accidentally to the contract. |
| `sdk.grantRole(req)` | Assigns a specific RBAC role to an account. |
| `sdk.revokeRole(req)` | Revokes a role from an account. |
| `sdk.getBalance(req)` | Queries the token balance of an address. |
| `sdk.getRoles(req)` | Returns all roles held by an account. |

### Signing Modes
The SDK supports multiple signing backends:

| Mode | Description |
| :--- | :--- |
| **Client** | Direct signing with a Hedera Client (operator ID + private key) |
| **Signer** | Signing with an ethers Signer (MetaMask, private key) |
| **Custodial** | Fireblocks, DFNS, AWS KMS via a callback interface |
| **External** | Serializes transactions for external signing (WalletConnect, HashPack) |
| **MultiSig** | Serializes for multi-signature coordination via the Backend API |

### Initialization
```typescript
import { StableCoinSDK } from "@hashgraph/stablecoin-npm-sdk";

// From environment variables
const sdk = StableCoinSDK.fromEnvironment();

// Or with explicit configuration
const sdk = new StableCoinSDK({
  network: 'testnet',
  signing: { type: 'client', client },
});
```

# Smart Contract Architecture

The system uses a **Hybrid Model**: Native Asset Management (HTS) + Programmable Logic (EVM).

## 1. Patterns & Standards
* **Factory Pattern**: The `StablecoinFactory.sol` handles the atomic creation of the HTS token and the management contract.
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
1. **User** triggers `Factory.deploy()`.
2. **Factory** creates a **Native Token (HTS)**.
3. **Factory** deploys a **Proxy** pointing to the **Stablecoin Logic**.
4. **Admin Keys** of the Token are assigned to the **Proxy Contract**.

[Back to Home](../intro.md)
