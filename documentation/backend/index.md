---
id: index
title: "🏠 Backend Overview"
sidebar_label: "🏠 Overview"
slug: /backend
---

# 🏠 Backend Service

The **Backend Service** is a module designed to be used in combination with the **Hedera StableCoin Studio**. Its primary purpose is to enable multi-signatures for stable coins management operations.

## 💡 Context

Whenever users need to submit a transaction to the DLT network (e.g., Cash In, Freeze, etc.) associated with an account that has multiple keys (key list or threshold keys), they interact with this backend to coordinate the collection of signatures.

> ⚠️ **Important Constraint**: Only **single level** multikeys are supported for now. Keys lists or Threshold keys associated with accounts cannot contain other key lists or threshold keys themselves as keys.

## 🏗️ Core Technologies

The service is built using a modern and robust stack:
- **Runtime**: [Node.js](https://nodejs.org/en/)
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) & [TypeORM](https://typeorm.io/)
- **Documentation**: [Swagger](https://swagger.io/)
- **Hedera SDKs**: [@hashgraph/sdk](https://github.com/hashgraph/hedera-sdk-js) 
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **Testing**: [Jest](https://jestjs.io/)

## 📚 Document Sections
1. [**Architecture**](./architecture.md): Deep dive into the transaction flow and background jobs.
2. [**Installation**](./installation.md): Full setup guide, environment variables, and testing.
3. [**API Reference**](./api-reference.md): Detailed endpoint definitions and logic.
4. [**Troubleshooting**](./troubleshooting.md): Common issues and log management.