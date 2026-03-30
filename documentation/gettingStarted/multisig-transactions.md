# Multisig Transactions

This guide explains how to set up and execute multi-signature transactions in the Stablecoin Studio.

> **Note**: Multisig requires a **native Hedera wallet** (e.g., HashPack). You can connect via WalletConnect as long as the underlying wallet is a native Hedera wallet. MetaMask and other EVM-only wallets are not supported.

## Prerequisites

- The **backend module** must be running before you can use multisig.
- You need **two Hedera accounts** (Account1 and Account2) — the `createMultisig` script sets up a 2-of-2 multisig, so **both accounts must sign** every transaction.

---

## Step 1 — Start the Backend

The multisig feature depends on the backend service. Before testing, you must bring it up:

1. Run the build command for the project.
2. Place the required `.env` files in the appropriate directories.
3. Start the services:

```bash
docker compose up -d --build
```

---

## Step 2 — Create Multisig Accounts

1. Navigate to the `scripts` folder inside the SDK.
2. Run the build command to compile the latest changes before executing any script:

```bash
npm run build
```

3. Run the multisig creation script:

```bash
execute:createMultisig
```

This creates a **2-of-2 multisig account** with Account1 and Account2 as signers. Both accounts are required to sign every transaction.

---

## Step 3 — Token and Account Setup

1. Create a token.
2. Create a multisig account — use **Account1** as the primary signer.
3. If you made any changes to the scripts, run the build command before proceeding:

```bash
npm run build
```

4. Associate the token to the multisig account:

```bash
execute:associateToken
```

---

## Step 4 — Configure Permissions

1. Open the application UI.
2. Log in with **Account1**.
3. Assign a role to the multisig account (e.g., `freeze`).
4. Log out.

---

## Step 5 — Initiate a Multisig Transaction

1. Click on the **Multisig** option in the navigation.
2. Enter your multisig account address.
   - If the token is not visible in the dropdown, import it manually.
3. Go to **Operations** and create a freeze transaction:
   - **Target account**: Account1
   - **Execution time**: set a future timestamp (e.g., current time + 5 minutes)
4. Confirm the transaction.

The transaction will be created with a `pending` status and scheduled for the specified execution time.

---

## Step 6 — Approve the Transaction

Both Account1 and Account2 must sign. Repeat the following for each account:

1. Open **Multisig Transactions** — the status should show as `pending`.
2. Log out and log back in with **Account1**.
3. Select the token and navigate to the multisig section.
4. Sign (approve) the pending transaction.
5. Log out and log back in with **Account2**.
6. Select the same token and navigate to the multisig section.
7. Sign (approve) the same pending transaction.

The transaction status will remain `pending` until both signatures are collected.

---

## Step 7 — Execution and Verification

1. Wait until the scheduled execution time has passed.
2. Check the transaction status — it should update to `executed`.

> **Warning**: Ensure the multisig account has **enough HBAR** to cover transaction fees. If the balance is insufficient at execution time, the transaction will fail.
