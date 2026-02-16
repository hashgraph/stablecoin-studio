---
id: overview
title: "Backend - Overview"
sidebar_label: Overview
sidebar_position: 1
---

# Backend Overview

The **Backend Service** enables multi-signature transaction coordination for Stablecoin Studio. When a Hedera account requires multiple keys to sign a transaction, this service collects and manages the signatures.

---

## How It Works

1. The first signer creates a transaction proposal via the API.
2. The backend stores it temporarily (3-minute validity window).
3. Other key holders retrieve and sign the transaction.
4. Once the signature threshold is met, the backend submits the fully signed transaction to Hedera.

> **Single-level keys only**: Key lists or threshold keys cannot contain nested key lists or threshold keys.

---

## Core Technologies

| Technology | Purpose |
| :--- | :--- |
| [Node.js](https://nodejs.org/) | Runtime |
| [NestJS](https://nestjs.com/) | Framework |
| [PostgreSQL](https://www.postgresql.org/) + [TypeORM](https://typeorm.io/) | Database |
| [Swagger](https://swagger.io/) | API documentation |
| [@hashgraph/sdk](https://github.com/hashgraph/hedera-sdk-js) | Hedera integration |
| [Winston](https://github.com/winstonjs/winston) | Logging |
| [Jest](https://jestjs.io/) | Testing |

---

## When You Need It

The backend is **optional**. You only need it when operating stablecoins with multi-key accounts (keyList or thresholdKey). Single-key accounts can use the SDK, CLI, or Web DApp directly.
