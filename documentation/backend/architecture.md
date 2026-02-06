---
id: architecture
title: "🏗️ Architecture & Internals"
sidebar_label: "🏗️ Architecture"
---

# 🏗️ Architecture & Internals

This section details the internal design of the Backend, intended for developers who need to extend the functionality or understand the data flow.

## 🛠 Tech Stack

* **Runtime**: Node.js (v18+)
* **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
* **Database**: [PostgreSQL](https://www.postgresql.org/) 14+
* **ORM**: [TypeORM](https://typeorm.io/)
* **Hedera Integration**: [@hashgraph/sdk](https://github.com/hashgraph/hedera-sdk-js) 
* **Documentation**: [Swagger](https://swagger.io/) (OpenAPI 3.0)
* **Logging**: [Winston](https://github.com/winstonjs/winston)
* **Testing**: [Jest](https://jestjs.io/)

---

## 🧩 Modular Design

The application follows a Domain-Driven Design (DDD) approach via NestJS Modules:

| Module | Description |
| :--- | :--- |
| **TransactionModule** | **Core Logic**. Handles the creation, storage, signature collection, and submission of Multi-sig transactions. |
| **EventModule** | Listens to Smart Contract events emitted on the Hedera Network and syncs them to the local DB. |
| **ProxyModule** | Forwards read-only requests to Mirror Nodes, adding a layer of caching or security (optional). |
| **NetworkModule** | Manages the connection context (Testnet/Mainnet) and Client initialization. |

---

## 🔄 The Multi-Signature Flow

The most critical function of the backend is coordinating asynchronous signatures.

```mermaid
sequenceDiagram
    participant Admin1 as Initiator
    participant API as Backend API
    participant DB as Postgres
    participant J as Auto-Submit Job
    participant H as Hedera Network

    Admin1->>API: POST /transactions (Raw Tx + 1st Sig)
    API->>DB: Save PENDING transaction
    Note over API,DB: 3-minute validity starts
    loop Asynchronous Signing
        Admin2->>API: GET /transactions (Pending)
        Admin2->>API: POST /transactions/{id}/sign
        API->>DB: Update Signatures
    end
    Note over DB: Threshold Met? Status = SIGNED
    J->>DB: Scan SIGNED transactions every 30s
    J->>H: Submit Full Transaction
    H-->>J: Success Receipt
    J->>DB: Update Status: EXECUTED
```

## 🕰️ The Auto-Submit Job (Scheduled Job)
The background worker (`AUTO_SUBMIT_JOB_FREQUENCY`) performs:
1.  **Auto-Submit**: Sends `SIGNED` transactions to Hedera.
2.  **Auto-Expire**: Marks transactions as `EXPIRED` if they aren't executed within **3 minutes** of `startDate`.

---

## 🗄️ Database Schema

The persistence layer uses a relational model to track the state of operations.

```mermaid
erDiagram
    TRANSACTION ||--|{ SIGNATURE : has
    TRANSACTION {
        string id PK
        string transactionMessage "Encoded Hedera Tx"
        string description
        string status "PENDING, SIGNED, EXECUTED, EXPIRED, ERROR"
        timestamp startDate
    }
    SIGNATURE {
        string id PK
        string transactionId FK
        string publicKey
        string signature
    }
```

### Key Entities
1.  **Transaction**: Stores the *raw bytes* (`transactionMessage`) of the Hedera Transaction.
2.  **Signature**: Stores the cryptographic signature, public key, and relation to the Tx.

---

## 📡 Event Listener System

The backend includes a polling mechanism to catch events:
1.  **FactoryObserver**: Watches for new Stablecoins deployed.
2.  **TokenObserver**: Watches for `CashIn`, `Burn`, and `Transfer` events.