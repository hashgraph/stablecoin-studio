---
id: wallet-adapters
title: "SDK - Wallet Adapters"
sidebar_label: Wallet Adapters
sidebar_position: 4
---

# Wallet Adapters

The SDK supports multiple signing backends through `SupportedWallets`. Choose the adapter that matches your environment:

| Adapter | `SupportedWallets` value | Environment |
|---|---|---|
| Client | `CLIENT` | Server-side / scripts (private key held by SDK) |
| MetaMask | `METAMASK` | Browser (EVM wallet extension) |
| HashPack | `HASHPACK` | Browser (Hedera wallet extension) |
| Hedera Wallet Connect | `HWALLETCONNECT` | Browser (WalletConnect — HashPack, MetaMask, others) |
| External Hedera | `EXTERNAL_HEDERA` | Any (SDK serializes; you sign with Hedera SDK) |
| External EVM | `EXTERNAL_EVM` | Any (SDK serializes; you sign with ethers.js) |
| Multisig | `MULTISIG` | Any (backend collects co-signatures) |
| Fireblocks | `FIREBLOCKS` | Server-side custodial |
| DFNS | `DFNS` | Server-side custodial |
| AWS KMS | `AWSKMS` | Server-side custodial |

The `CLIENT` adapter is the default and is covered in [Quick Start](./quick-start.md). The rest are documented below.

---

## MetaMask

MetaMask is an EVM browser wallet. The SDK connects via the injected `window.ethereum` provider — no private key is passed.

```typescript
import {
  Network,
  ConnectRequest,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';

await Network.connect(
  new ConnectRequest({
    account: { accountId: '0.0.12345' },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.METAMASK,
  }),
);
```

MetaMask will prompt the user to approve the connection. The SDK uses the EVM path for all transactions with this adapter.

---

## HashPack

HashPack is a Hedera browser wallet extension. The SDK connects via the HashPack injected provider.

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: '0.0.12345' },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.HASHPACK,
  }),
);
```

HashPack will prompt the user to approve each transaction. The SDK uses the Hedera path for transactions with this adapter.

---

## Hedera Wallet Connect (HWC)

HWC uses the [WalletConnect](https://walletconnect.com/) protocol via `@hashgraph/hedera-wallet-connect` and `@reown/appkit`. It works in browser environments and supports any WalletConnect-compatible wallet (HashPack, MetaMask, and others).

You need a **Reown project ID** — get one at [cloud.reown.com](https://cloud.reown.com).

```typescript
import {
  Network,
  ConnectRequest,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';

await Network.connect(
  new ConnectRequest({
    account: { accountId: '0.0.12345' },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.HWALLETCONNECT,
    hwcSettings: {
      projectId: 'YOUR_REOWN_PROJECT_ID',
      dappName: 'My Stablecoin App',
      dappDescription: 'Stablecoin management dashboard',
      dappURL: 'https://myapp.example.com',
      dappIcons: ['https://myapp.example.com/icon.png'],
    },
  }),
);
```

> HWC only works in browser environments (`window` must be defined). The adapter lazy-loads `@hashgraph/hedera-wallet-connect` and `@reown/appkit` at runtime.

---

## External Hedera

With `EXTERNAL_HEDERA`, the SDK builds and serializes a Hedera transaction but does **not** sign or submit it. Your code receives the raw bytes, signs them with any Hedera-compatible key, and submits.

This is useful for hardware wallets, custodial backends, or any signing system that accepts Hedera transaction bytes.

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MY_ACCOUNT_ID! },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.EXTERNAL_HEDERA,
  }),
);
```

Use the `build*` variant of any operation to get the serialized transaction:

```typescript
import { StableCoin, CashInRequest } from '@hashgraph/stablecoin-npm-sdk';
import { Transaction, PrivateKey } from '@hiero-ledger/sdk';

const result = await StableCoin.buildCashIn(
  new CashInRequest({ tokenId, targetId: accountId, amount: '10' }),
);

const bytes = Buffer.from(result.serializedTransaction, 'hex');
const tx = Transaction.fromBytes(bytes);
const signedTx = await tx.sign(privateKey);
const response = await signedTx.execute(hederaClient);
const receipt = await response.getReceipt(hederaClient);
console.log('Status:', receipt.status.toString()); // SUCCESS
```

---

## External EVM

With `EXTERNAL_EVM`, the SDK builds an unsigned EVM transaction. Your code signs it with an ECDSA key via ethers.js and broadcasts it.

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MY_ACCOUNT_ID! },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.EXTERNAL_EVM,
  }),
);
```

```typescript
import { ethers } from 'ethers';
import { StableCoin, BurnRequest } from '@hashgraph/stablecoin-npm-sdk';

const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
const ethWallet = new ethers.Wallet(process.env.MY_PRIVATE_KEY_ECDSA!, provider);

const result = await StableCoin.buildBurn(
  new BurnRequest({ tokenId, amount: '5' }),
);

const unsignedTx = ethers.Transaction.from(result.serializedTransaction);
unsignedTx.nonce = await provider.getTransactionCount(ethWallet.address);
const feeData = await provider.getFeeData();
unsignedTx.maxFeePerGas = feeData.maxFeePerGas;
unsignedTx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

const signedTx = await ethWallet.signTransaction(unsignedTx);
const txResponse = await provider.broadcastTransaction(signedTx);
const receipt = await txResponse.wait(1, 60_000);
console.log('Status:', receipt?.status === 1 ? 'SUCCESS' : 'FAILED');
```

---

## Multisig

The `MULTISIG` adapter posts transactions to a backend signing service. Multiple co-signers must approve before the backend auto-submits.

Requires a running backend (see the backend package in this repository) and custom consensus node configuration.

```typescript
import {
  Network,
  InitializationRequest,
  ConnectRequest,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';

const consensusNodes = [
  { url: process.env.CONSENSUS_NODE_URL!, nodeId: process.env.CONSENSUS_NODE_ID! },
];

// Initialize with backend URL
await Network.init(
  new InitializationRequest({
    network: 'custom',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    configuration: {
      factoryAddress: process.env.FACTORY_ADDRESS!,
      resolverAddress: process.env.RESOLVER_ADDRESS!,
    },
    consensusNodes,
    backend: { url: process.env.BACKEND_URL! },
  }),
);

// Connect as the multisig account
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MULTISIG_ACCOUNT_ID! },
    network: 'custom',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.MULTISIG,
    consensusNodes,
  }),
);
```

Transactions submitted with the multisig wallet return a backend `transactionId`. Co-signers add their signatures via `StableCoin.signTransaction()`:

```typescript
import {
  StableCoin,
  FreezeAccountRequest,
  SignTransactionRequest,
} from '@hashgraph/stablecoin-npm-sdk';

// Multisig account submits the tx
const result = await StableCoin.freeze(
  new FreezeAccountRequest({ tokenId, targetId: process.env.MULTISIG_ACCOUNT_ID! }),
);
const transactionId = result.transactionId!;

// A co-signer (CLIENT wallet) adds their signature
await StableCoin.signTransaction(
  new SignTransactionRequest({ transactionId }),
);
// Backend auto-submits once the signature threshold is reached
```

---

## Custodial Wallets

The SDK integrates with three custodial key management providers via `custodialWalletSettings`. All three use the Hedera signing path.

### Fireblocks

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MY_ACCOUNT_ID! },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.FIREBLOCKS,
    custodialWalletSettings: {
      apiSecretKey: process.env.FIREBLOCKS_API_SECRET_KEY!,
      apiKey: process.env.FIREBLOCKS_API_KEY!,
      baseUrl: process.env.FIREBLOCKS_BASE_URL!,
      vaultAccountId: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID!,
      assetId: process.env.FIREBLOCKS_ASSET_ID!,
      hederaAccountId: process.env.MY_ACCOUNT_ID!,
    },
  }),
);
```

### DFNS

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MY_ACCOUNT_ID! },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.DFNS,
    custodialWalletSettings: {
      authorizationToken: process.env.DFNS_AUTHORIZATION_TOKEN!,
      credentialId: process.env.DFNS_CREDENTIAL_ID!,
      serviceAccountPrivateKey: process.env.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY!,
      urlApplicationOrigin: process.env.DFNS_URL_APPLICATION_ORIGIN!,
      applicationId: process.env.DFNS_APPLICATION_ID!,
      baseUrl: process.env.DFNS_BASE_URL!,
      walletId: process.env.DFNS_WALLET_ID!,
      hederaAccountId: process.env.MY_ACCOUNT_ID!,
      publicKey: process.env.DFNS_PUBLIC_KEY!,
    },
  }),
);
```

### AWS KMS

```typescript
await Network.connect(
  new ConnectRequest({
    account: { accountId: process.env.MY_ACCOUNT_ID! },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.AWSKMS,
    custodialWalletSettings: {
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      awsRegion: process.env.AWS_REGION!,
      awsKmsKeyId: process.env.AWS_KMS_KEY_ID!,
      hederaAccountId: process.env.MY_ACCOUNT_ID!,
    },
  }),
);
```

---

## Full Examples

Working end-to-end examples are available in the SDK example folder:

| File | Description |
|---|---|
| [testExternalHedera.ts](../../packages/sdk/example/ts/testExternalHedera.ts) | Full test suite with the External Hedera adapter |
| [testExternalEVM.ts](../../packages/sdk/example/ts/testExternalEVM.ts) | Full test suite with the External EVM adapter |
| [multisigFreeze.ts](../../packages/sdk/example/ts/multisigFreeze.ts) | Full multisig freeze flow (deploy → grant role → co-sign) |
| [multisigFreezeDFNS.ts](../../packages/sdk/example/ts/multisigFreezeDFNS.ts) | Multisig flow using a DFNS custodial wallet as a co-signer |

---

## Next Steps

- [Usage](./usage.md) — Full list of token operations (mint, burn, holds, fees, etc.)
- [Architecture](./architecture.md) — How the SDK connects to Hedera
