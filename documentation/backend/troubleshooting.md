---
id: troubleshooting
title: "🔍 Troubleshooting"
sidebar_label: "🔍 Troubleshooting"
---

# 🔍 Troubleshooting

If you encounter issues while running the backend, check the common scenarios below.

## 🐳 Docker Issues

### 1. `exec user process caused: exec format error`
**Platform**: macOS (M1/M2 chips).
**Cause**: The Docker image was built for `linux/amd64` but you are running on ARM64.
**Solution**:
Add the platform flag to your `docker-compose.yml`:
```yaml
services:
  backend:
    platform: linux/amd64
    ...
```
Or ensure you have **Rosetta** enabled in Docker Desktop settings.

### 2. Database Connection Refused
**Error**: `TypeORM Connection Error: connect ECONNREFUSED 127.0.0.1:5432`
**Cause**: The backend service cannot reach the Postgres container.
**Solution**:
* If running **inside Docker**: Ensure `DATABASE_HOST` is set to the service name (e.g., `postgres`), NOT `localhost`.
* If running **locally**: Ensure Docker is actually running (`docker ps`).

---

## 🔗 Hedera & Network Issues

### 1. `Status: EXPIRED`
**Cause**: The 3-minute validity window closed before reaching the signature threshold.
**Solution**: Coordinate signers or increase the `AUTO_SUBMIT_JOB_FREQUENCY`.

### 2. `Status: INDETERMINATE`
**Cause**: The transaction was sent, but the Mirror Node hasn't confirmed it yet.
**Solution**: The backend automatically retries checking the status. If it persists, check if the Hedera Network is experiencing delays or if your Operator account ran out of HBAR.

### 3. `INVALID_SIGNATURE`
**Cause**: The signature provided in `/transactions/sign` does not match the Public Key associated with the Account ID.
**Solution**:
* Ensure you are signing the **exact same transaction body** bytes stored in the DB.
* Check if the Key Type (ED25519 vs ECDSA) is correctly handled in your client.

---

## 🛠️ Logging & Debugging

To see verbose output, adjust the `LOG_LEVEL` in your `.env` file or directly in the terminal:

```bash
# Enable full debug logs
LOG_LEVEL=debug npm run start:dev
```

You can view live logs from the Docker container:
```bash
docker-compose logs -f backend
```