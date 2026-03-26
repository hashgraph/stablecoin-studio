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

import { Client } from '@hiero-ledger/sdk';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import {
  isConfigured,
  evmAliasFromKey,
  parsePrivateKey,
  fetchAllEvents,
  printSummary,
  type OpSummary,
} from './helpers/e2e-helpers.js';
import { registerCommonOperations, type E2EContext } from './helpers/e2e-operations.js';

// ── Test suite ──────────────────────────────────────────────────────────────────

const TIMEOUT = 120_000; // EVM path via relay can be slower
const describeFn = isConfigured() ? describe : describe.skip;

describeFn('EVM E2E — stablecoin operations via JSON-RPC relay', () => {
  const summary: OpSummary[] = [];
  const ctx: E2EContext = {
    sdk: null as any,
    operatorEvm: '',
    hederaClient: null as any,
    proxyAddress: '',
    tokenAddress: '',
    logPrefix: 'EVM',
    summary,
    timeout: TIMEOUT,
  };

  beforeAll(() => {
    const privateKey = process.env.HEDERA_PRIVATE_KEY!;
    ctx.operatorEvm = evmAliasFromKey(privateKey);

    // SDK with EVM signing (type: 'signer')
    ctx.sdk = new StableCoinSDK({
      network: 'testnet',
      signing: { type: 'signer', privateKey },
    });

    // Hedera client still needed for token association and transfer (HTS-native)
    ctx.hederaClient = Client.forTestnet();
    const hederaKey = parsePrivateKey(privateKey);
    ctx.hederaClient.setOperator(process.env.HEDERA_OPERATOR_ID!, hederaKey);

    console.log(`\n[EVM PATH] Operator EVM address: ${ctx.operatorEvm}`);
    console.log(`  JSON-RPC relay: https://testnet.hashio.io/api`);
  });

  afterAll(async () => {
    await fetchAllEvents(summary);
    printSummary(summary);
  }, 60_000);

  // All common operations — same as HederaE2E but via EVM pipeline
  registerCommonOperations(ctx);
});
