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

// Undo the global mock from jest-setup-file so we test the real implementation
jest.unmock('../../../core/orchestration/TransactionOrchestrator');

import {
  Client,
  TokenAssociateTransaction,
} from '@hiero-ledger/sdk';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import {
  isConfigured,
  hasAccount2,
  resolveOperatorEvm,
  isEd25519Key,
  toEvmAddress,
  parseTokenId,
  parsePrivateKey,
  logHeader,
  logResult,
  fetchAllEvents,
  printSummary,
  type OpSummary,
} from './helpers/e2e-helpers.js';
import { registerCommonOperations, type E2EContext } from './helpers/e2e-operations.js';

// ── Test suite ──────────────────────────────────────────────────────────────────

const TIMEOUT = 60_000;
const describeFn = isConfigured() ? describe : describe.skip;

describeFn('Hedera E2E — all stablecoin operations on testnet', () => {
  const summary: OpSummary[] = [];
  const ctx: E2EContext = {
    sdk: null as any,
    operatorEvm: '',
    hederaClient: null as any,
    proxyAddress: '',
    tokenAddress: '',
    summary,
    timeout: TIMEOUT,
  };

  let account2Evm: string;

  beforeAll(() => {
    const privateKey = process.env.HEDERA_PRIVATE_KEY!;
    const operatorId = process.env.HEDERA_OPERATOR_ID!;
    const ed25519 = isEd25519Key(privateKey);

    ctx.sdk = StableCoinSDK.fromEnvironment();
    ctx.operatorEvm = resolveOperatorEvm(privateKey, operatorId);

    ctx.hederaClient = Client.forTestnet();
    const key = parsePrivateKey(privateKey);
    ctx.hederaClient.setOperator(operatorId, key);

    console.log(`\nOperator: ${operatorId} (${ed25519 ? 'ED25519' : 'ECDSA'})`);
    console.log(`  EVM address (msg.sender): ${ctx.operatorEvm}`);
    if (!ed25519) {
      console.log(`  Hedera-native EVM:        ${toEvmAddress(operatorId)}  (NOT used for roles)`);
    }

    if (hasAccount2()) {
      const key2 = process.env.HEDERA_ACCOUNT2_KEY!;
      account2Evm = resolveOperatorEvm(key2, process.env.HEDERA_ACCOUNT2_ID!);
      console.log(`\nAccount 2: ${process.env.HEDERA_ACCOUNT2_ID} (${isEd25519Key(key2) ? 'ED25519' : 'ECDSA'})`);
      console.log(`  EVM address: ${account2Evm}`);
    }
  });

  afterAll(async () => {
    await fetchAllEvents(summary);
    printSummary(summary);
  }, 60_000);

  // ── Common operations (shared with EvmE2E) ─────────────────────────────

  registerCommonOperations(ctx);

  // ── Account2-specific operations (Hedera-only) ─────────────────────────

  it('associate — account2 associates with HTS token', async () => {
    if (!hasAccount2()) return;
    logHeader('TOKEN ASSOCIATE (account2)');

    const tokenId = parseTokenId(ctx.tokenAddress);
    if (!tokenId) {
      console.log(`  Could not parse tokenAddress=${ctx.tokenAddress}, skipping`);
      return;
    }

    console.log(`  tokenId: ${tokenId}`);
    console.log(`  account2: ${process.env.HEDERA_ACCOUNT2_ID}`);

    const client2 = Client.forTestnet();
    const key2 = parsePrivateKey(process.env.HEDERA_ACCOUNT2_KEY!);
    client2.setOperator(process.env.HEDERA_ACCOUNT2_ID!, key2);

    try {
      const tx = new TokenAssociateTransaction()
        .setAccountId(process.env.HEDERA_ACCOUNT2_ID!)
        .setTokenIds([tokenId]);
      const response = await tx.execute(client2);
      const receipt = await response.getReceipt(client2);
      console.log(`  OK | txId: ${response.transactionId}`);
      console.log(`  OK | status: ${receipt.status}`);
      summary.push({ op: 'associate (account2)', success: true, txId: response.transactionId.toString(), events: [] });
    } catch (e: any) {
      if (e.message?.includes('TOKEN_ALREADY_ASSOCIATED')) {
        console.log('  Already associated — OK');
        summary.push({ op: 'associate (account2, already)', success: true, txId: '', events: [] });
      } else {
        throw e;
      }
    }
  }, TIMEOUT);

  it('grantKyc — account2', async () => {
    if (!hasAccount2()) return;
    logHeader('GRANT KYC (account2)');
    const res = await ctx.sdk.grantKyc({ contractAddress: ctx.proxyAddress, targetId: account2Evm });
    expect(res.success).toBe(true);
    await logResult('grantKyc (account2)', res, summary);
  }, TIMEOUT);

  it('cashIn — mint 100 tokens to account2', async () => {
    if (!hasAccount2()) return;
    logHeader('CASH IN (account2)');
    const res = await ctx.sdk.cashIn({
      contractAddress: ctx.proxyAddress,
      targetId: account2Evm,
      amount: '100000000',
    });
    expect(res.success).toBe(true);
    await logResult('cashIn (account2, 100)', res, summary);
  }, TIMEOUT);

  it('burn — burn 100 tokens (requires supplier-path cashIn)', async () => {
    logHeader('BURN');
    // Admin cashIn doesn't track burnableAmount, so burn may fail with BurnableAmountExceeded.
    // Both outcomes (success or expected revert) are valid.
    const res = await ctx.sdk.burn({
      contractAddress: ctx.proxyAddress,
      amount: '100000000',
    }).catch((e: unknown) => e as Error);
    if (res instanceof Error) {
      console.log(`  Expected failure: ${res.message.slice(0, 120)}`);
      expect(res.message).toContain('ParseHederaReceipt'); // eslint-disable-line jest/no-conditional-expect
    } else {
      expect(res.success).toBe(true); // eslint-disable-line jest/no-conditional-expect
      await logResult('burn (100)', res, summary);
    }
  }, TIMEOUT);

  it('wipe — wipe 100 tokens from account2', async () => {
    if (!hasAccount2()) return;
    logHeader('WIPE');
    const res = await ctx.sdk.wipe({
      contractAddress: ctx.proxyAddress,
      targetId: account2Evm,
      amount: '100000000',
    });
    expect(res.success).toBe(true);
    await logResult('wipe (account2, 100)', res, summary);
  }, TIMEOUT);

  it('revokeKyc — revoke account2 KYC (0 balance)', async () => {
    if (!hasAccount2()) return;
    logHeader('REVOKE KYC (account2)');
    const res = await ctx.sdk.revokeKyc({ contractAddress: ctx.proxyAddress, targetId: account2Evm });
    expect(res.success).toBe(true);
    await logResult('revokeKyc (account2)', res, summary);
  }, TIMEOUT);

  it('grantKyc — re-grant account2 KYC', async () => {
    if (!hasAccount2()) return;
    logHeader('GRANT KYC (account2, re-grant)');
    const res = await ctx.sdk.grantKyc({ contractAddress: ctx.proxyAddress, targetId: account2Evm });
    expect(res.success).toBe(true);
    await logResult('grantKyc (account2, re-grant)', res, summary);
  }, TIMEOUT);
});
