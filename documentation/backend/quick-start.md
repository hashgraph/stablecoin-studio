---
id: quick-start
title: "Backend - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

You can run the backend in two modes: **Dockerized** (recommended) or **Local Development**.

---

## Prerequisites

* **Node.js** v18.13.0 or higher
* **Docker & Docker Compose** v2.0+
* **PostgreSQL** v14+ (if running locally)

---

## Option 1: Docker (Recommended)

```bash
cd stablecoin-studio/backend
cp .env.sample .env
# Edit .env with your Hedera credentials (see Configuration below)
docker-compose up -d --build
```

* **API**: `http://localhost:3001`
* **Swagger**: `http://localhost:3001/api`
* **Database**: Port `5432`

---

## Option 2: Local Development

```bash
npm install
docker-compose up -d postgres          # DB only
npm run typeorm:migration:run           # Sync schema
npm run start:dev                       # Watch mode
```

---

## Configuration (.env)

### General Settings

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API listening port | `3001` |
| `NODE_ENV` | Environment context | `development` |
| `GLOBAL_REQUEST_LIMIT` | Rate limiting (req/min) | `100` |

### Database Connection

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_HOST` | Hostname | `localhost` or `postgres` |
| `DATABASE_PORT` | Port | `5432` |
| `DATABASE_USER` | DB User | `postgres` |
| `DATABASE_PASSWORD` | DB Password | `secret` |
| `DATABASE_NAME` | DB Name | `stablecoin_studio` |

### Hedera Network

| Variable | Description | Required |
| :--- | :--- | :--- |
| `HEDERA_NETWORK` | `testnet`, `previewnet`, or `mainnet` | Yes |
| `OPERATOR_ID` | Account ID paying for backend txs | Yes |
| `OPERATOR_KEY` | Private Key (ECDSA/ED25519) | Yes |
| `MIRROR_NODE_URL` | Custom Mirror Node endpoint | No |

---

## Running Tests

```bash
npm run test        # Unit tests
npm run test:e2e    # Integration tests (requires DB)
npm run test:cov    # Coverage report
```
