---
id: multisig
title: "Web - Multisig"
sidebar_label: Multisig
sidebar_position: 5
---

# Multisig Transactions

> **Important**: Before following this guide, make sure you have completed the full project setup. See the [Quick Start](../gettingStarted/quick-start.md) guide for installation and configuration instructions.

This guide walks you through executing a multi-signature transaction using the Web DApp. The example performs a freeze operation with a 2-of-2 multisig account, where both signers must approve before execution. We recommend using **HashPack** as the wallet.

> **Note**: Multisig requires a **native Hedera wallet**. We recommend **HashPack**, which you can connect via WalletConnect. MetaMask and other EVM-only wallets are not supported.

## Prerequisites

- The **full project setup** must be completed (see [Quick Start](../gettingStarted/quick-start.md)).
- A **multisig account** on Hedera with a key list (e.g., 2-of-2).
- A **token** associated to the multisig account.
- The multisig account must have **enough HBAR** to pay for transaction fees.

> **Don't have a multisig account yet?** Helper scripts are available in `packages/sdk/example/ts/multisig/` to quickly create a multisig account and associate a token for testing purposes. See the [Demo Setup](#demo-setup) section at the bottom of this guide.

---

## Step 1 — Start the Backend

The multisig feature depends on the backend service. Navigate to the `apps/backend` folder and bring it up:

1. Place the required `.env` file in the backend directory.
2. Start the services:

```bash
docker compose up -d --build
```

---

## Step 2 — Configure Permissions

1. Open the Web DApp.
2. Log in with one of the signer accounts using HashPack.
3. Select the token associated to the multisig account.
4. Assign a role to the multisig account. For this example, assign the **freeze** role.
5. Log out.

> **Note**: The multisig account must have the appropriate role for the operation you want to perform. In this example we use `freeze`, but you can assign any role (e.g., `cashin`, `burn`, etc.).

---

## Step 3 — Connect with the Multisig Account

1. In the connection modal, select **Multisig account**.
2. Choose the **network** and enter the **multisig account ID**. Click **Connect**.

![Multisig login](../img/scs-multisig-login.png)

3. Select the **stablecoin** you want to operate with from the dropdown at the top.

---

## Step 4 — Create a Multisig Transaction

1. Go to **Operations** and create a freeze transaction:
   - **Target account**: any account associated with the token.
   - **Execution time**: set a future timestamp (e.g., current time + 5 minutes).
2. Confirm the transaction. It will appear with a `pending` status.

---

## Step 5 — Sign the Transaction

Each signer in the key list must approve the pending transaction individually:

1. Log in with the first signer account using HashPack.
2. In the sidebar, go to **Multi-sig transactions**.
3. Find the pending transaction and sign (approve) it.
4. Log out.
5. Log in with the next signer account using HashPack.
6. Repeat steps 2-3.

The transaction status will remain `pending` until all required signatures are collected.

---

## Step 6 — Execution and Verification

Once all signatures are collected, the transaction status changes to `SIGNED`. You can **Delete** it if you want to cancel it before the scheduled execution time.

![Multisig transactions view](../img/scs-multisig.png)

When the scheduled execution time arrives, the transaction is automatically submitted to the Hedera network and the status will update to `executed`. Verify the operation took effect (e.g., the target account should now be frozen).

> **Warning**: If the multisig account does not have enough HBAR to cover transaction fees at execution time, the transaction will fail.

---

## Demo Setup

If you don't have a multisig account yet, you can use the helper scripts in `packages/sdk/example/ts/multisig/` to set one up for testing.

You need **two Hedera accounts** with ECDSA private keys. If you don't have them, create them in the [Hedera Developer Portal](https://portal.hedera.com/).

### 1. Create a Multisig Account

Open `packages/sdk/example/ts/multisig/CreateMultisigAccount.ts` and set the private keys:

```typescript
const Multisig_ECDSA_1_privateKey = '<your-account1-private-key>';
const Multisig_ECDSA_2_privateKey = '<your-account2-private-key>';
```

From the `packages/sdk/example/ts` folder, run:

```bash
npm run execute:createMultisig
```

Save the resulting multisig account ID and send HBAR to it for transaction fees.

### 2. Associate a Token

Create a token using the CLI or Web DApp. Then open `packages/sdk/example/ts/multisig/AssociateToken.ts` and configure the multisig account ID, the token ID, and the private keys of both signers.

From the `packages/sdk/example/ts` folder, run:

```bash
npm run execute:associateToken
```

Once done, return to [Step 2](#step-2--configure-permissions) to continue with the guide.
