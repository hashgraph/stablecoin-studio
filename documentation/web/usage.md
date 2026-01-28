---
id: usage
title: "🧭 Usage"
sidebar_label: "🧭 Usage"
---

> **Web UI Documentation**
>
> [🚀 Getting Started](./README.md) • [🏗️ Architecture & Stack](./architecture.md) • [🕹️ Usage & Workflows](./usage.md) • [⚙️ Configuration](./configuration.md) • [🛡️ Security](./security.md)
---

# 🕹️ Usage & Workflows

The Web UI covers the three main pillars of Stablecoin Management.

## 1. Token Creation (The Wizard)
The **"New Coin"** button launches a step-by-step wizard that abstracts the complexity of the Factory contract.

* **Step 1:** Define Name, Symbol, and Decimals.
* **Step 2:** Configure Initial Supply and Max Supply.
* **Step 3:** Assign initial keys (Admin, KYC, Wipe, etc.). *By default, the connected wallet is assigned all keys.*
* **Result:** The DApp calls `sdk.createStableCoin()` and redirects to the dashboard.

## 2. Treasury Management
Located in the **"Treasury"** tab. This view allows the `CASHIN_ROLE` and `BURN_ROLE` to manage supply.

* **Cash In (Minting):** Select a target address and amount. Increases total supply.
* **Cash Out (Burning):** Select amount to burn from the treasury balance. Decreases total supply.

## 3. Compliance & RBAC
Located in the **"User Management"** or **"Settings"** tabs.

* **Role Assignment:** Visualize a table of current admins. Grant or Revoke roles (e.g., giving "KYC Officer" role to a specific DID).
* **User Check:** Check if a specific account is Frozen or KYC'd.
* **Freeze/Unfreeze:** Emergency controls to stop transfers for a specific account.

> **Note:** Buttons for operations (like "Freeze") will be **disabled or hidden** if the connected wallet does not possess the required Role on the smart contract.
