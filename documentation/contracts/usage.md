---
id: usage
title: "Smart Contracts - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Usage

The contract test suite validates all stablecoin functionality against a live Hedera network (testnet or local). Tests follow the arrange-act-assert pattern and are fully self-contained, so they can run in any order or in parallel.

---

## Configuration

### Test Accounts

Create a `.env` file from `.env.sample` and configure two Hedera accounts:

```env
# Private keys in RAW format (not DER)
TESTNET_PRIVATE_KEY_0='0x...'
TESTNET_PRIVATE_KEY_1='0x...'
```

Both accounts must exist on the target Hedera network and have enough HBAR to cover contract deployments, token creations, and invocations.

| Account | Variable | Role in Tests |
| --- | --- | --- |
| Operator | `PRIVATE_KEY_0` | Deploys the stablecoin, has full rights |
| Non-operator | `PRIVATE_KEY_1` | No rights unless explicitly granted during the test |

---

## Running Tests

### All Tests

```shell
npm test
```

### Parallel Execution

```shell
npm run test:parallel
```

Tests are organized into two parallel threads (`test/Thread0/` and `test/Thread1/`) for faster CI execution.

### Specific Test File

```shell
npm run test:kyc
```

---

## Build and Compile

Before running tests, ensure contracts are compiled:

```shell
npm run compile          # Compile modified contracts only
npm run compile:force    # Force recompile all contracts and build package
npm run build            # Build package without recompiling
```

Compilation generates a `build/typechain-types/` folder with TypeScript bindings:

```typescript
import { hederaTokenManager__factory } from '@hashgraph/stablecoin-npm-contracts/typechain-types';
```

---

## Other Commands

| Command | Description |
| --- | --- |
| `npm run size` | Check contract sizes in KiB |
| `npm run lint:sol` | Lint Solidity code |
| `npm run lint:ts` | Lint TypeScript code |
| `npm run lint` | Lint Solidity and TypeScript |
| `npm run prettier` | Format all code |
| `npm run pre-commit` | Run prettier and lint |
| `npm run slither` | Run Slither security analysis |
| `npm run doc` | Generate contract documentation in Markdown |
