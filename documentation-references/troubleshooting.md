---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_position: 3
---

# Troubleshooting

Common issues across all Stablecoin Studio modules and how to resolve them.

---

## General

### "Invalid Private Key"

The SDK and CLI expect private keys in **hex (raw) format**, not DER. Copy the hex key from the [Hedera Portal](https://portal.hedera.com), not the DER-encoded version.

### "Token Not Associated"

The recipient account must associate with the Token ID before receiving transfers. Use the CLI, Web DApp, or SDK to associate the token with the target account.

### Docker Errors

If the Mirror Node or backend fails to start, ensure the required ports are free:
- **5432** — PostgreSQL
- **8080** — Mirror Node API

---

## Smart Contracts

### Transaction Reverted Without Reason

Check that the calling account has the required role for the operation. Most facet functions are role-gated (e.g., only the cash-in role can mint).

### Contract Size Exceeds Limit

Run `npm run size` in the `contracts/` directory to check contract sizes. If a facet exceeds the 24 KiB limit, consider splitting it into smaller facets.

---

## Backend

### `exec user process caused: exec format error`

**Platform**: macOS (M1/M2 chips).
The Docker image was built for `linux/amd64` but you are running on ARM64. Add `platform: linux/amd64` to your `docker-compose.yml` or enable Rosetta in Docker Desktop settings.

### Database Connection Refused

**Error**: `TypeORM Connection Error: connect ECONNREFUSED 127.0.0.1:5432`

- **Inside Docker**: Set `DATABASE_HOST` to the service name (e.g., `postgres`), not `localhost`.
- **Running locally**: Ensure Docker is running (`docker ps`).

### `Status: EXPIRED`

The 3-minute validity window closed before collecting all required signatures. Coordinate signers more quickly or increase `AUTO_SUBMIT_JOB_FREQUENCY`.

### `INVALID_SIGNATURE`

The signature does not match the public key associated with the account:
- Ensure you are signing the exact transaction body bytes stored in the backend.
- Check that the key type (ED25519 vs ECDSA) is handled correctly in your client.

### Logging

Enable debug logs for verbose output:

```bash
LOG_LEVEL=debug npm run start:dev
```

For Docker:

```bash
docker-compose logs -f backend
```

---

## SDK

### Wallet Adapter Not Found

Ensure the wallet extension (HashPack, MetaMask, or Blade) is installed in your browser. For custodial (server-side) usage, configure the custodial adapter with the account credentials.

### Network Mismatch

The SDK will reject operations if the configured network does not match the wallet's active network. Ensure both point to the same environment (testnet, mainnet).

---

## CLI

### Configuration Not Found

The CLI looks for `hsca-config.yaml` in the current directory. If it cannot find it, create one from `hsca-config.sample.yaml` and configure your accounts, networks, and factory addresses.

---

## Web DApp

### Blank Page After Build

Check that `REACT_APP_FACTORIES` and `REACT_APP_RESOLVERS` are set in `web/.env`. These must be valid JSON arrays with factory and resolver addresses for your target network.

### Wallet Connection Fails

Ensure the wallet extension is unlocked and connected to the correct Hedera network. The DApp checks the wallet's active network against the configured environment.
