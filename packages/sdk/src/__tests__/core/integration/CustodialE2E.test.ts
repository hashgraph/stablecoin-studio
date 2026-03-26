/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Client } from '@hiero-ledger/sdk';
import {
  CustodialWalletService,
  FireblocksConfig,
  DFNSConfig,
  AWSKMSConfig,
  SignatureRequest,
} from '@hashgraph/hedera-custodians-integration';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import type { CustodialSigner } from '../../../core/config/SigningConfig.js';
import {
  toEvmAddress,
  logHeader,
  logResult,
  fetchAllEvents,
  printSummary,
  type OpSummary,
} from './helpers/e2e-helpers.js';
import { registerCommonOperations, type E2EContext } from './helpers/e2e-operations.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

const MIRROR_BASE = 'https://testnet.mirrornode.hedera.com/api/v1';

/**
 * Fetch the account's public key from mirror node.
 * Custodial providers don't give us the public key directly —
 * we need it to create the Hedera Client with setOperatorWith().
 */
async function fetchPublicKey(accountId: string): Promise<string> {
  const res = await fetch(`${MIRROR_BASE}/accounts/${accountId}`);
  if (!res.ok) throw new Error(`Mirror node error fetching ${accountId}: ${res.status}`);
  const data = await res.json() as any;
  const key = data.key?.key;
  if (!key) throw new Error(`No public key found for account ${accountId}`);
  return key;
}

/**
 * Create a Hedera Client configured for custodial signing.
 * Uses setOperatorWith() which accepts a signing callback instead of a private key.
 */
function createCustodialClient(
  network: string,
  accountId: string,
  publicKey: string,
  walletService: CustodialWalletService,
): Client {
  let client: Client;
  switch (network) {
    case 'testnet':    client = Client.forTestnet(); break;
    case 'mainnet':    client = Client.forMainnet(); break;
    case 'previewnet': client = Client.forPreviewnet(); break;
    default: throw new Error(`Unsupported network: ${network}`);
  }

  client.setOperatorWith(
    accountId,
    publicKey,
    async (message: Uint8Array) => {
      const request = new SignatureRequest(message);
      return walletService.signTransaction(request);
    },
  );

  return client;
}

/**
 * Wrap a CustodialWalletService as a CustodialSigner for the core pipeline.
 */
function wrapAsCustodialSigner(walletService: CustodialWalletService): CustodialSigner {
  return {
    async sign(req: { transactionBytes: Uint8Array }): Promise<Uint8Array> {
      const signatureRequest = new SignatureRequest(req.transactionBytes);
      return walletService.signTransaction(signatureRequest);
    },
  };
}

// ── Fireblocks ─────────────────────────────────────────────────────────────────

function isFireblocksConfigured(): boolean {
  return !!(
    process.env.HEDERA_NETWORK &&
    process.env.HEDERA_FACTORY_ADDRESS &&
    process.env.HEDERA_RESOLVER_ADDRESS &&
    process.env.FIREBLOCKS_API_KEY &&
    process.env.FIREBLOCKS_API_SECRET_KEY &&
    process.env.FIREBLOCKS_BASE_URL &&
    process.env.FIREBLOCKS_VAULT_ACCOUNT_ID &&
    process.env.FIREBLOCKS_ASSET_ID &&
    process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID
  );
}

const fireblocksDescribe = isFireblocksConfigured() ? describe : describe.skip;

fireblocksDescribe('Fireblocks E2E — custodial signing via Fireblocks', () => {
  const TIMEOUT = 120_000; // custodial signing can be slower (remote HSM)
  const summary: OpSummary[] = [];
  const ctx: E2EContext = {
    sdk: null as any,
    operatorEvm: '',
    hederaClient: null as any,
    proxyAddress: '',
    tokenAddress: '',
    logPrefix: 'Fireblocks',
    summary,
    timeout: TIMEOUT,
  };

  beforeAll(async () => {
    const accountId = process.env.FIREBLOCKS_HEDERA_ACCOUNT_ID!;
    const network = process.env.HEDERA_NETWORK!;

    // Create Fireblocks wallet service
    const walletService = new CustodialWalletService(
      new FireblocksConfig(
        process.env.FIREBLOCKS_API_KEY!,
        process.env.FIREBLOCKS_API_SECRET_KEY!,
        process.env.FIREBLOCKS_BASE_URL!,
        process.env.FIREBLOCKS_VAULT_ACCOUNT_ID!,
        process.env.FIREBLOCKS_ASSET_ID!,
      ),
    );

    // Fetch public key from mirror node
    const publicKey = await fetchPublicKey(accountId);

    // Create client with custodial signing
    const client = createCustodialClient(network, accountId, publicKey, walletService);
    ctx.hederaClient = client;

    // Create SDK with custodial signing config
    ctx.sdk = new StableCoinSDK({
      network: network as any,
      signing: {
        type: 'custodial',
        client,
        custodialSigner: wrapAsCustodialSigner(walletService),
      },
    });

    ctx.operatorEvm = toEvmAddress(accountId);
    ctx.operatorAccountId = accountId;

    console.log(`\n[Fireblocks] Account: ${accountId}`);
    console.log(`  EVM address: ${ctx.operatorEvm}`);
    console.log(`  Public key:  ${publicKey.slice(0, 20)}...`);
  }, TIMEOUT);

  afterAll(async () => {
    await fetchAllEvents(summary);
    printSummary(summary);
  }, 60_000);

  registerCommonOperations(ctx);
});

// ── DFNS ───────────────────────────────────────────────────────────────────────

function isDfnsConfigured(): boolean {
  return !!(
    process.env.HEDERA_NETWORK &&
    process.env.HEDERA_FACTORY_ADDRESS &&
    process.env.HEDERA_RESOLVER_ADDRESS &&
    process.env.DFNS_SERVICE_ACCOUNT_SECRET_KEY &&
    process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID &&
    process.env.DFNS_SERVICE_ACCOUNT_AUTH_TOKEN &&
    process.env.DFNS_APP_ORIGIN &&
    process.env.DFNS_APP_ID &&
    process.env.DFNS_BASE_URL &&
    process.env.DFNS_WALLET_ID &&
    process.env.DFNS_PUBLIC_KEY &&
    process.env.DFNS_HEDERA_ACCOUNT_ID
  );
}

const dfnsDescribe = isDfnsConfigured() ? describe : describe.skip;

dfnsDescribe('DFNS E2E — custodial signing via DFNS', () => {
  const TIMEOUT = 120_000;
  const summary: OpSummary[] = [];
  const ctx: E2EContext = {
    sdk: null as any,
    operatorEvm: '',
    hederaClient: null as any,
    proxyAddress: '',
    tokenAddress: '',
    logPrefix: 'DFNS',
    summary,
    timeout: TIMEOUT,
  };

  beforeAll(async () => {
    const accountId = process.env.DFNS_HEDERA_ACCOUNT_ID!;
    const network = process.env.HEDERA_NETWORK!;

    // Create DFNS wallet service
    const walletService = new CustodialWalletService(
      new DFNSConfig(
        process.env.DFNS_SERVICE_ACCOUNT_SECRET_KEY!,
        process.env.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID!,
        process.env.DFNS_SERVICE_ACCOUNT_AUTH_TOKEN!,
        process.env.DFNS_APP_ORIGIN!,
        process.env.DFNS_APP_ID!,
        process.env.DFNS_BASE_URL!,
        process.env.DFNS_WALLET_ID!,
        process.env.DFNS_PUBLIC_KEY!,
      ),
    );

    // Fetch public key from mirror node
    const publicKey = await fetchPublicKey(accountId);

    // Create client with custodial signing
    const client = createCustodialClient(network, accountId, publicKey, walletService);
    ctx.hederaClient = client;

    // Create SDK with custodial signing config
    ctx.sdk = new StableCoinSDK({
      network: network as any,
      signing: {
        type: 'custodial',
        client,
        custodialSigner: wrapAsCustodialSigner(walletService),
      },
    });

    ctx.operatorEvm = toEvmAddress(accountId);
    ctx.operatorAccountId = accountId;

    console.log(`\n[DFNS] Account: ${accountId}`);
    console.log(`  EVM address: ${ctx.operatorEvm}`);
    console.log(`  Public key:  ${publicKey.slice(0, 20)}...`);
  }, TIMEOUT);

  afterAll(async () => {
    await fetchAllEvents(summary);
    printSummary(summary);
  }, 60_000);

  registerCommonOperations(ctx);
});

// ── AWS KMS ────────────────────────────────────────────────────────────────────

function isAwsKmsConfigured(): boolean {
  return !!(
    process.env.HEDERA_NETWORK &&
    process.env.HEDERA_FACTORY_ADDRESS &&
    process.env.HEDERA_RESOLVER_ADDRESS &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_KMS_KEY_ID &&
    process.env.AWS_KMS_HEDERA_ACCOUNT_ID
  );
}

const awsDescribe = isAwsKmsConfigured() ? describe : describe.skip;

awsDescribe('AWS KMS E2E — custodial signing via AWS KMS', () => {
  const TIMEOUT = 120_000;
  const summary: OpSummary[] = [];
  const ctx: E2EContext = {
    sdk: null as any,
    operatorEvm: '',
    hederaClient: null as any,
    proxyAddress: '',
    tokenAddress: '',
    logPrefix: 'AWS-KMS',
    summary,
    timeout: TIMEOUT,
  };

  beforeAll(async () => {
    const accountId = process.env.AWS_KMS_HEDERA_ACCOUNT_ID!;
    const network = process.env.HEDERA_NETWORK!;

    // Create AWS KMS wallet service
    const walletService = new CustodialWalletService(
      new AWSKMSConfig(
        process.env.AWS_ACCESS_KEY_ID!,
        process.env.AWS_SECRET_ACCESS_KEY!,
        process.env.AWS_REGION!,
        process.env.AWS_KMS_KEY_ID!,
      ),
    );

    // Fetch public key from mirror node
    const publicKey = await fetchPublicKey(accountId);

    // Create client with custodial signing
    const client = createCustodialClient(network, accountId, publicKey, walletService);
    ctx.hederaClient = client;

    // Create SDK with custodial signing config
    ctx.sdk = new StableCoinSDK({
      network: network as any,
      signing: {
        type: 'custodial',
        client,
        custodialSigner: wrapAsCustodialSigner(walletService),
      },
    });

    ctx.operatorEvm = toEvmAddress(accountId);
    ctx.operatorAccountId = accountId;

    console.log(`\n[AWS KMS] Account: ${accountId}`);
    console.log(`  EVM address: ${ctx.operatorEvm}`);
    console.log(`  Public key:  ${publicKey.slice(0, 20)}...`);
  }, TIMEOUT);

  afterAll(async () => {
    await fetchAllEvents(summary);
    printSummary(summary);
  }, 60_000);

  registerCommonOperations(ctx);
});
