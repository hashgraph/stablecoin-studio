---
id: installation
title: "🚀 Installation & Setup"
sidebar_label: "🚀 Installation"
---

# 🚀 Installation & Setup

You can run the backend in two modes: **Dockerized** (recommended for quick deployment) or **Bare Metal** (for development).

## ✅ Prerequisites

* **Node.js**: v18.13.0 or higher.
* **Docker & Docker Compose**: v2.0+.
* **PostgreSQL**: v14+ (if running locally).
* **Git**: To clone the repository.

---

## 🐳 Option 1: Docker (Production/Demo)

The repository includes a `docker-compose.yml` that orchestrates the NestJS app and the Postgres DB.

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/hashgraph/stablecoin-studio.git](https://github.com/hashgraph/stablecoin-studio.git)
    cd stablecoin-studio/backend
    ```

2.  **Configure Environment:**
    ```bash
    cp .env.sample .env
    # Edit .env with your specific Hedera credentials (see table below)
    ```

3.  **Start Services:**
    ```bash
    docker-compose up -d --build
    ```
    * **API**: Available at `http://localhost:3001`
    * **Swagger**: Available at `http://localhost:3001/api`
    * **Database**: Port `5432`

---

## 💻 Option 2: Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Setup Database:**
    You must have a Postgres instance running. You can use Docker just for the DB:
    ```bash
    docker-compose up -d postgres
    ```

3.  **Run Migrations:**
    Ensure the DB schema is synced.
    ```bash
    npm run typeorm:migration:run
    ```

4.  **Start the Server:**
    ```bash
    # Watch mode (Hot reload)
    npm run start:dev
    
    # Production build
    npm run start:prod
    ```

---

## ⚙️ Configuration (.env)

The application relies heavily on environment variables.

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
| `HEDERA_NETWORK` | `testnet`, `previewnet`, or `mainnet` | ✅ |
| `OPERATOR_ID` | Account ID paying for backend txs | ✅ |
| `OPERATOR_KEY` | Private Key (ECDSA/ED25519) | ✅ |
| `MIRROR_NODE_URL` | Custom Mirror Node endpoint | ❌ |

---

## 🧪 Running Tests

The project includes unit and integration tests using **Jest**.

```bash
# Unit tests
npm run test

# Integration tests (requires DB)
npm run test:e2e

# Test coverage report
npm run test:cov
```