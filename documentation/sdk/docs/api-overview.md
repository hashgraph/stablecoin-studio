# 🧭 API Overview

Below is a summary of the primary interfaces available in the `StableCoinClient`.

## 🛠️ Core Methods

| Method | Description | Roles Required |
| :--- | :--- | :--- |
| `createStableCoin(req)` | Deploys a new stablecoin instance via Factory. | None |
| `mint(req)` | Mints new tokens to a target account. | `CASHIN_ROLE` |
| `burn(req)` | Burns tokens from the treasury. | `BURN_ROLE` |
| `wipe(req)` | Removes tokens from a user's account. | `WIPE_ROLE` |
| `transfer(req)` | Transfers tokens between accounts. | None |
| `freeze(req)` | Freezes an account (stops transfers). | `FREEZE_ROLE` |
| `unfreeze(req)` | Unfreezes an account. | `FREEZE_ROLE` |
| `grantKyc(req)` | Flags an account as KYC verified. | `KYC_ROLE` |

## 🛂 Access Control (Roles)

The SDK uses strict RBAC (Role-Based Access Control).

- `BURN_ROLE` 🔥
- `WIPE_ROLE` 🧹
- `RESCUE_ROLE` 🚑
- `PAUSE_ROLE` ⏸️
- `FREEZE_ROLE` ❄️
- `KYC_ROLE` 📋
- `CASHIN_ROLE` 💵 (Minting)
- `DEFAULT_ADMIN_ROLE` 👑

For full type definitions, please refer to the TypeScript definition files included in the package.
