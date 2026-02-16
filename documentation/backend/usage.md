---
id: usage
title: "Backend - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Usage

The Backend exposes a RESTful API (v1) documented with OpenAPI 3.0.

---

## Interactive Documentation (Swagger)

* **URL**: `http://localhost:3001/api`
* **JSON Spec**: `http://localhost:3001/api-json`

---

## Core Endpoints

### Transactions (`/v1/transactions`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/transactions` | Creates a new transaction proposal |
| `PUT` | `/v1/transactions/{id}/signature` | Submits a signature |
| `PATCH` | `/v1/transactions/{id}` | Updates transaction description |
| `DELETE` | `/v1/transactions/{id}` | Removes a transaction |
| `GET` | `/v1/transactions` | Lists transactions (filters: `status`, `accountId`, `network`) |
| `GET` | `/v1/transactions/publicKey/{publicKey}` | Retrieves transactions for a specific key |

### Health & Network

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Returns `{ status: "ok" }` |
| `GET` | `/network/environment` | Returns configured network and Mirror Nodes |

---

## Authentication & Security

* **CORS**: Configured via the `ORIGIN` variable in `.env`
* **Rate Limiting**: Protected by `nestjs/throttler` (default: 100 reqs/min)
* **Validation**: Uses `class-validator` for DTO integrity

### Example: Health Check

```bash
curl -X GET http://localhost:3001/health
```

---

## Debugging

To see verbose output, adjust the `LOG_LEVEL`:

```bash
LOG_LEVEL=debug npm run start:dev
```

View live logs from Docker:

```bash
docker-compose logs -f backend
```
