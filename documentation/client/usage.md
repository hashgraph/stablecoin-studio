---
id: usage
title: "🧭 Interactive Menu Flow"
sidebar_label: "Interactive Usage"
---

# 🧭 Interactive Menu Flow

The CLI operates through a rich interactive menu system. Once you execute `npm start` or `accelerator wizard`, you will navigate through these core sections.

## 1. Create a New Stablecoin
This wizard guides you through the deployment of a generic stablecoin contract.

* **Token Details**: Defines the immutable metadata (Name, Symbol, Decimals).
* **Supply Management**:
    * *Initial Supply*: Tokens minted immediately to the treasury.
    * *Max Supply*: Hard cap on the total tokens (optional).
* **Key Management (Critical)**:
    * You must decide who holds the keys for specific roles (`Admin`, `KYC`, `Freeze`, `Wipe`, `Supply`, `Fee`).
    * **Smart Contract**: The key is owned by the contract (trustless).
    * **Current Account**: You hold the key (centralized control).
    * **Other Account**: Assign control to a different specific ID (e.g., a cold wallet).
* **Advanced Features**:
    * **Proof of Reserve**: Link your token minting capability to an on-chain Oracle feed.
    * **Grant KYC**: If enabled, accounts must be explicitly approved before holding tokens.

## 2. Manage Imported Tokens
Useful for **Disaster Recovery** or **Team Collaboration**.
* Allows you to manage a stablecoin created on a different machine or by another user.
* **Requirement**: You must know the `Token ID` and possess the private keys for the roles you want to exercise.

## 3. Operate with Stablecoin
The operational hub for day-to-day management.

### 💰 Treasury Operations
* **Cash in (Mint)**: Create new tokens. If PoR is enabled, this checks the oracle feed first.
* **Burn**: Remove tokens from the treasury balance.
* **Wipe**: Forcefully remove tokens from a *user's* account (requires Wipe Key). Used for legal compliance/law enforcement.
* **Rescue**: Recover HBAR or other HTS tokens accidentally sent to the stablecoin contract address.

### 🛡️ Access Control & Risk
* **Grant/Revoke KYC**: Whitelist or Blacklist accounts (if KYC was enabled at creation).
* **Freeze/Unfreeze**: Stop a specific account from transferring tokens.
* **Update Roles**: Rotate keys (e.g., transfer Admin rights to a Multi-sig).

### ☢️ Danger Zone
* **Pause Token**: Halts ALL transfers globally.
* **Delete Token**: Permanently removes the token from the ledger (Irreversible).

## 4. Multi-Signature Transactions
Manage the asynchronous flow of multi-sig operations via the configured backend.
* **List**: See pending transactions waiting for signatures.
* **Details**: Inspect the transaction payload before signing.
* **Sign**: Use your local key to add a signature.
* **Remove**: Delete a pending transaction from the backend.
* **Send**: Once the signature threshold is met, submit to Hedera network.

## 5. Configuration (Settings)
Modify your environment on the fly without editing files manually.
* **Mirrors/RPCs**: Switch between providers, or **Add/Remove** custom node URLs.
* **Factories**: Update the pointer to the smart contract logic.
* **Backend**: Connect or disconnect the Multi-sig coordination server.