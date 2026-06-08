---
id: examples
title: "SDK - Examples"
sidebar_label: Examples
sidebar_position: 5
---

# Examples

The `packages/sdk/example/ts/` folder contains runnable TypeScript examples that cover the full SDK surface. They all target Hedera **testnet** and share a single `.env` file.

---

## Setup

### 1. Build the SDK first

The examples depend on `@hashgraph/stablecoin-npm-sdk` resolved from the local source (`packages/sdk/`). If the SDK has not been built yet, `npm install` inside the example folder will fail to resolve the package and all imports will break.

The easiest way is to run the root setup command, which installs and builds the entire project:

```bash
# From the repo root
npm run setup
```

> If you cloned the repo and skipped this step, this is the most common reason examples fail to run.

### 2. Copy the env template

```bash
cd packages/sdk/example
cp .env.sample .env
```

### 3. Fill in `.env`

Open `.env` and fill in the values for the examples you want to run. See [Environment Variables](#environment-variables) below for a full explanation of each variable.

### 4. Install dependencies and build the examples

```bash
cd packages/sdk/example/ts
npm install
npm run build
```

Build output is placed in `packages/sdk/example/ts/build/`.

---

## Environment Variables

The `.env` file lives at `packages/sdk/example/.env` and is shared across all examples.

### Core (required by all examples)

| Variable | Description |
|---|---|
| `MY_ACCOUNT_ID` | Your Hedera testnet account ID (e.g. `0.0.12345`) |
| `MY_PRIVATE_KEY` | ED25519 or ECDSA private key for `MY_ACCOUNT_ID` (hex) |
| `MY_PRIVATE_KEY_ECDSA` | ECDSA private key (without `0x` prefix) — required by the EVM external adapter and DFNS examples |
| `FACTORY_ADDRESS` | Hedera account ID of the deployed Factory contract (e.g. `0.0.XXXX`) |
| `RESOLVER_ADDRESS` | Hedera account ID of the deployed Resolver contract (e.g. `0.0.XXXX`) |

> `FACTORY_ADDRESS` and `RESOLVER_ADDRESS` are deployed infrastructure addresses for the Factory and Resolver contracts. If you are running against the shared public testnet deployment, use the addresses provided in the project's getting started guide.

### External wallet examples

| Variable | Description |
|---|---|
| `TOKEN_ID` | (Optional) Reuse an existing token ID in `testExternalEVM` — skips token creation |
| `TOKEN_ID_HEDERA` | (Optional) Reuse an existing token ID in `testExternalHedera` — skips token creation |

### Multisig example (`multisigFreeze.ts`)

| Variable | Description |
|---|---|
| `MULTISIG_ACCOUNT_ID` | The Hedera account ID whose keys are managed via the multisig backend |
| `BACKEND_URL` | URL of the multisig backend service (e.g. `http://127.0.0.1:3001/api/transactions/`) |
| `CONSENSUS_NODE_URL` | Custom consensus node endpoint (e.g. `34.94.106.61:50211`) |
| `CONSENSUS_NODE_ID` | Node account ID for the above endpoint (e.g. `0.0.3`) |

### DFNS examples (`createDFNSMultisigAccount.ts` / `multisigFreezeDFNS.ts`)

| Variable | Description |
|---|---|
| `DFNS_MULTISIG_ACCOUNT_ID` | Account ID created by `createDFNSMultisigAccount` (set after running it) |
| `DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN` | DFNS service account JWT |
| `DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID` | DFNS credential ID |
| `DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_OR_PATH` | DFNS EC private key (PEM string or path to file) |
| `DFNS_APP_ORIGIN` | Application origin URL registered in DFNS |
| `DFNS_APP_ID` | DFNS application ID |
| `DFNS_BASE_URL` | DFNS API base URL (e.g. `https://api.dfns.ninja`) |
| `DFNS_WALLET_ID` | DFNS wallet ID linked to the Hedera account |
| `DFNS_WALLET_PUBLIC_KEY` | Public key of the DFNS wallet (hex, no `0x`) |
| `DFNS_HEDERA_ACCOUNT_ID` | Hedera account ID managed by the DFNS wallet |

---

## Running Examples

All scripts are defined in `packages/sdk/example/ts/package.json`. Run them from that directory:

```bash
cd packages/sdk/example/ts
npm run <script-name>
```

Each script builds the TypeScript first (`npm run build`) then runs the compiled output.

---

## Example Reference

### Token Creation

| Script | File | What it does |
|---|---|---|
| `start-creation` | [creation.ts](../../packages/sdk/example/ts/creation.ts) | Creates a basic stablecoin with all roles assigned to your account and no reserve |
| `start-creation-with-reserve` | [creationWithReserve.ts](../../packages/sdk/example/ts/creationWithReserve.ts) | Creates a stablecoin and deploys a Chainlink-compatible reserve data feed alongside it |
| `start-creation-with-reserve-address` | [creationWithReserveAddress.ts](../../packages/sdk/example/ts/creationWithReserveAddress.ts) | Creates a stablecoin and links it to an existing reserve at an EVM address |
| `start-creation-assigning-keys` | [creationAssigningKeys.ts](../../packages/sdk/example/ts/creationAssigningKeys.ts) | Creates a stablecoin and assigns HTS token keys (freeze, KYC, wipe, pause) from your account's public key |

### Token Operations

| Script | File | What it does |
|---|---|---|
| `mint` | [mint.ts](../../packages/sdk/example/ts/mint.ts) | Creates a token, associates it, grants KYC, then mints 10 tokens and asserts the final balance is correct |
| `burn` | [burn.ts](../../packages/sdk/example/ts/burn.ts) | Creates a token, burns 10 from the initial supply, and asserts the total supply decreased |
| `wipe` | [wipe.ts](../../packages/sdk/example/ts/wipe.ts) | Creates a token, mints tokens, wipes 1 from the account balance, and asserts the final balance |

### Role Management

| Script | File | What it does |
|---|---|---|
| `roles` | [role.ts](../../packages/sdk/example/ts/role.ts) | Creates a token, revokes `WIPE_ROLE`, asserts it is gone, re-grants it, and asserts it is back |

### External Wallet Adapters

These examples run a comprehensive suite of **~40 operations** against a real testnet token, covering every SDK method: basic ops, compliance, roles, supplier allowance, custom fees, rescue, reserve, holds, config updates, and delete.

| Script | File | Adapter used | What it does |
|---|---|---|---|
| `test-external-evm` | [testExternalEVM.ts](../../packages/sdk/example/ts/testExternalEVM.ts) | `EXTERNAL_EVM` | Runs the full test suite; each operation is signed with ethers.js and broadcast to the JSON-RPC node |
| `test-external-hedera` | [testExternalHedera.ts](../../packages/sdk/example/ts/testExternalHedera.ts) | `EXTERNAL_HEDERA` | Runs the full test suite; each operation is signed with the Hedera SDK and submitted to the network |

Both print a summary table at the end showing PASS / FAIL / SKIP for every test.

The shared test suite logic lives in [testExternalCommon.ts](../../packages/sdk/example/ts/testExternalCommon.ts).

**Tip:** Set `TOKEN_ID` (for EVM) or `TOKEN_ID_HEDERA` (for Hedera) in `.env` to skip token creation and reuse an existing token across runs.

### Multisig

| Script | File | What it does |
|---|---|---|
| `multisig-freeze` | [multisigFreeze.ts](../../packages/sdk/example/ts/multisigFreeze.ts) | Full multisig flow: deploys a token with the CLIENT wallet, associates the multisig account, grants it `FREEZE_ROLE`, then submits a freeze via the MULTISIG wallet and co-signs with the deployer |
| `create-dfns-multisig-account` | [createDFNSMultisigAccount.ts](../../packages/sdk/example/ts/createDFNSMultisigAccount.ts) | Utility: creates a Hedera account whose KeyList includes the DFNS wallet public key. Run this once and copy the printed account ID into `DFNS_MULTISIG_ACCOUNT_ID` in `.env` |
| `multisig-freeze-dfns` | [multisigFreezeDFNS.ts](../../packages/sdk/example/ts/multisigFreezeDFNS.ts) | Same multisig freeze flow but the co-signer is a DFNS custodial wallet instead of a plain private key |

---

## Folder Structure

```
packages/sdk/example/
├── .env               ← your credentials (gitignored)
├── .env.sample        ← template with all variables documented
├── package.json
└── ts/
    ├── package.json   ← npm scripts for all examples
    ├── tsconfig.json
    ├── build/         ← compiled JS output (generated by npm run build)
    │
    ├── creation.ts
    ├── creationWithReserve.ts
    ├── creationWithReserveAddress.ts
    ├── creationAssigningKeys.ts
    ├── mint.ts
    ├── burn.ts
    ├── wipe.ts
    ├── role.ts
    ├── testExternalCommon.ts   ← shared test suite (~40 operations)
    ├── testExternalEVM.ts
    ├── testExternalHedera.ts
    ├── multisigFreeze.ts
    ├── createDFNSMultisigAccount.ts
    └── multisigFreezeDFNS.ts
```
