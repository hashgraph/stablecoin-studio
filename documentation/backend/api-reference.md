---
id: api-reference
title: "📡 API Reference"
sidebar_label: "📡 API Reference"
---

# 📡 API Reference

The Backend exposes a RESTful API (v1) documented with OpenAPI 3.0.

## 🕹️ Interactive Documentation (Swagger)
* **URL**: `http://localhost:3001/api`
* **JSON Spec**: `http://localhost:3001/api-json`

---

## 🎮 Core Controllers

### 1. Transactions (`/v1/transactions`)
* `POST /v1/transactions`: Creates a new proposal.
* `PUT /v1/transactions/{id}/signature`: Submits a signature.
* `PATCH /v1/transactions/{id}`: Update transaction description.
* `DELETE /v1/transactions/{id}`: Removes a transaction.
* `GET /v1/transactions`: List transactions (filters: `status`, `accountId`, `network`).
* `GET /v1/transactions/publicKey/{publicKey}`: Retrieve transactions for a specific key.

### 2. Network & Health
* `GET /health`: Returns `{ status: "ok" }`.
* `GET /network/environment`: Returns configured network and Mirror Nodes.

---

## 🔐 Authentication & Security

* **CORS**: Configured via the `ORIGIN` variable in `.env`.
* **Rate Limiting**: Protected by `nestjs/throttler` (Default: 100 reqs/min).
* **Validation**: Uses `class-validator` for DTO integrity.

### Example: Health Check
```bash
curl -X GET http://localhost:3001/health
```