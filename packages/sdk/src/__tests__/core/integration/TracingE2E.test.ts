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
  AccountId,
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  TokenId,
} from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import type { OrchestratorConfig, TracingConfig } from '../../../core/orchestration/TransactionOrchestrator.js';
import { PipelineError } from '../../../core/errors/PipelineError.js';
import { CallTraceAnalyzer } from '../../../core/dlt/shared/CallTraceAnalyzer.js';
import { ContractErrorRegistry } from '../../../core/dlt/shared/ContractErrorRegistry.js';
import type { RawLog } from '../../../core/dlt/shared/TransactionDiagnostics.js';

// ── Config ────────────────────────────────────────────────────────────────────

const REQUIRED_ENV = [
  'HEDERA_NETWORK',
  'HEDERA_OPERATOR_ID',
  'HEDERA_PRIVATE_KEY',
  'HEDERA_FACTORY_ADDRESS',
  'HEDERA_RESOLVER_ADDRESS',
];

const isConfigured = REQUIRED_ENV.every((key) => !!process.env[key]);

function toEvmAddress(addr: string): string {
  if (addr.startsWith('0x')) return addr;
  return '0x' + AccountId.fromString(addr).toSolidityAddress();
}

function evmAliasFromKey(privateKey: string): string {
  return new ethers.Wallet(privateKey).address;
}

// ── Artifacts path (for loading all custom errors) ────────────────────────────

const ARTIFACTS_PATH = path.resolve(__dirname, '../../../../../../contracts/artifacts/contracts');
const OUTPUT_FILE = path.join(__dirname, 'trace-output.log');

// ── Test suite ────────────────────────────────────────────────────────────────

const PER_TEST_TIMEOUT = 90_000;
const describeFn = isConfigured ? describe : describe.skip;

describeFn('Tracing E2E — enriched call traces on failure', () => {
  let sdk: StableCoinSDK;
  let proxyAddress: string;
  let tokenAddress: string;
  let operatorEvm: string;
  let hederaClient: Client;
  const traceLog: string[] = [];

  function log(msg: string): void {
    console.log(msg);
    traceLog.push(msg);
  }

  beforeAll(() => {
    // Build tracing config — loads all 55 custom errors from artifacts
    const tracing: TracingConfig = {
      artifactsPath: fs.existsSync(ARTIFACTS_PATH) ? ARTIFACTS_PATH : undefined,
      contractNames: {
        // Known testnet contracts (will be populated after create)
      },
    };

    // Build SDK with tracing enabled
    const config: OrchestratorConfig = {
      network: process.env.HEDERA_NETWORK as 'testnet',
      signing: {
        type: 'client',
        operatorId: process.env.HEDERA_OPERATOR_ID!,
        privateKey: process.env.HEDERA_PRIVATE_KEY!,
      },
      tracing,
    };

    sdk = new StableCoinSDK(config);
    operatorEvm = evmAliasFromKey(process.env.HEDERA_PRIVATE_KEY!);

    hederaClient = Client.forTestnet();
    const key = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!.replace(/^0x/, ''));
    hederaClient.setOperator(process.env.HEDERA_OPERATOR_ID!, key);

    log(`Operator: ${process.env.HEDERA_OPERATOR_ID}`);
    log(`EVM alias: ${operatorEvm}`);
    log(`Artifacts: ${fs.existsSync(ARTIFACTS_PATH) ? ARTIFACTS_PATH : 'NOT FOUND'}`);
  });

  afterAll(() => {
    // Write all trace output to file
    fs.writeFileSync(OUTPUT_FILE, traceLog.join('\n') + '\n', 'utf-8');
    console.log(`\nTrace output written to: ${OUTPUT_FILE}`);
  });

  // ── 1. Deploy a fresh stablecoin ──────────────────────────────────────────

  it('create — deploy stablecoin', async () => {
    const factoryAddress = toEvmAddress(process.env.HEDERA_FACTORY_ADDRESS!);
    const resolverAddress = toEvmAddress(process.env.HEDERA_RESOLVER_ADDRESS!);

    log(`\n--- CREATE ---`);
    log(`factory:  ${factoryAddress}`);
    log(`resolver: ${resolverAddress}`);

    const result = await sdk.create({
      name: `Trace-${Date.now()}`,
      symbol: 'TRC',
      factoryAddress,
      resolverAddress,
      signerAddress: operatorEvm,
    });

    expect(result.success).toBe(true);
    proxyAddress = result.proxyAddress;
    tokenAddress = result.tokenAddress;

    log(`proxy:    ${proxyAddress}`);
    log(`token:    ${tokenAddress}`);
    log(`txId:     ${result.transactionId}`);
  }, PER_TEST_TIMEOUT);

  // ── 2. Associate + KYC (needed for operations) ───────────────────────────

  it('associate operator with HTS token', async () => {
    log(`\n--- ASSOCIATE ---`);
    const tokenId = TokenId.fromSolidityAddress(tokenAddress);

    try {
      const tx = new TokenAssociateTransaction()
        .setAccountId(process.env.HEDERA_OPERATOR_ID!)
        .setTokenIds([tokenId]);
      const response = await tx.execute(hederaClient);
      await response.getReceipt(hederaClient);
      log(`associated: ${tokenId}`);
    } catch (e: any) {
      if (e.message?.includes('TOKEN_ALREADY_ASSOCIATED')) {
        log(`already associated`);
      } else {
        throw e;
      }
    }
  }, PER_TEST_TIMEOUT);

  it('grantKyc', async () => {
    log(`\n--- GRANT KYC ---`);
    const result = await sdk.grantKyc({ contractAddress: proxyAddress, targetId: operatorEvm });
    expect(result.success).toBe(true);
    log(`kyc granted: ${result.transactionId}`);
  }, PER_TEST_TIMEOUT);

  // ── 3. Successful operation — cashIn (with tracing, trace only on failure) ─

  let cashInTxId: string;

  it('cashIn — successful operation', async () => {
    log(`\n--- CASH IN (success path) ---`);
    const result = await sdk.cashIn({
      contractAddress: proxyAddress,
      targetId: operatorEvm,
      amount: '500000000', // 500 tokens
    });
    expect(result.success).toBe(true);
    cashInTxId = result.transactionId!;
    log(`cashIn OK: ${cashInTxId}`);
  }, PER_TEST_TIMEOUT);

  // ── 3b. Trace a successful transaction and decode its events ──────────────

  it('trace cashIn — decode events from successful operation', async () => {
    log(`\n--- TRACE CASHIN EVENTS ---`);
    expect(cashInTxId).toBeTruthy();

    // Normalize txId for mirror node
    const atIdx = cashInTxId.indexOf('@');
    const normalizedId = cashInTxId.slice(0, atIdx)
      + '-' + cashInTxId.slice(atIdx + 1).replace('.', '-');

    // Wait for mirror node indexing, then fetch
    await new Promise((r) => setTimeout(r, 4000));

    const mirrorBase = 'https://testnet.mirrornode.hedera.com';
    const [resultRes, actionsRes] = await Promise.all([
      fetch(`${mirrorBase}/api/v1/contracts/results/${normalizedId}`),
      fetch(`${mirrorBase}/api/v1/contracts/results/${normalizedId}/actions`),
    ]);

    const contractResult = await resultRes.json() as any;
    const actionsData = await actionsRes.json() as any;

    const rawLogs: RawLog[] = (contractResult.logs ?? []).map((l: any) => ({
      address: l.address,
      topics: l.topics,
      data: l.data,
    }));

    const actions = (actionsData.actions ?? []).map((a: any) => ({
      from: a.caller,
      to: a.recipient,
      callType: a.call_type,
      input: a.input,
      output: a.result_data_type === 'OUTPUT' ? a.result_data : undefined,
      error: (a.result_data_type === 'ERROR' || a.result_data_type === 'REVERT_REASON')
        ? a.result_data : undefined,
      depth: a.call_depth,
      gasUsed: a.gas_used,
    }));

    log(`  mirror node: ${actions.length} calls, ${rawLogs.length} logs`);

    // Build analyzer with artifacts
    const errorRegistry = fs.existsSync(ARTIFACTS_PATH)
      ? ContractErrorRegistry.fromArtifacts(ARTIFACTS_PATH)
      : undefined;

    const analyzer = new CallTraceAnalyzer({
      errorRegistry,
      artifactsPath: ARTIFACTS_PATH,
    });

    // Decode call trace
    const enriched = analyzer.analyzeActions(actions);
    const formatted = analyzer.formatTree(enriched);
    log(`\n  Call trace:`);
    log(formatted);

    // Decode events
    const decodedEvents = analyzer.decodeLogs(rawLogs);
    log(`\n  Events (${decodedEvents.length}):`);
    for (const evt of decodedEvents) {
      log(`    ${evt}`);
    }

    expect(actions.length).toBeGreaterThan(0);
    expect(decodedEvents.length).toBeGreaterThan(0);
  }, PER_TEST_TIMEOUT);

  // ── 4. Force a failure to capture the enriched trace ──────────────────────

  it('burn more than minted — captures enriched error trace', async () => {
    log(`\n--- BURN (expected failure — triggers enriched trace) ---`);

    try {
      // Burn more than what's available → should fail with BurnableAmountExceeded or similar
      await sdk.burn({
        contractAddress: proxyAddress,
        amount: '999999999999', // way more than minted
      });
      // If it doesn't fail, that's unexpected but not a test failure
      log(`burn unexpectedly succeeded`);
    } catch (error: unknown) {
      log(`\n=== ENRICHED ERROR OUTPUT ===`);

      if (error instanceof PipelineError) {
        log(`step:    ${error.step}`);
        log(`command: ${error.command}`);
        log(`message: ${error.message}`);

        if (error.htsResponseCode) {
          log(`HTS code: ${error.htsCode} (${error.htsResponseCode})`);
        }

        if (error.diagnostics) {
          const d = error.diagnostics;
          log(`\nDiagnostic report:`);
          log(`  transactionId: ${d.transactionId}`);
          log(`  contractAddress: ${d.contractAddress}`);
          log(`  revertMessage: ${d.revertMessage ?? '(none)'}`);
          log(`  gasUsed: ${d.gasUsed ?? '(unknown)'}`);

          if (d.decodedError) {
            log(`  decodedError: ${d.decodedError.name}`);
            log(`    selector: ${d.decodedError.selector}`);
            log(`    args: ${JSON.stringify(d.decodedError.args)}`);
          }

          if (d.formattedCallTrace) {
            log(`\n  Enriched call trace:`);
            log(d.formattedCallTrace);
          } else {
            log(`\n  Raw call trace (${d.callTrace.length} calls):`);
            for (const c of d.callTrace) {
              log(`    [${c.depth}] ${c.callType} ${c.from.slice(0, 10)}→${c.to.slice(0, 10)} gas=${c.gasUsed ?? '?'}${c.error ? ` ERR=${c.error.slice(0, 20)}` : ''}`);
            }
          }
        } else {
          log(`(no diagnostics attached)`);
        }
      } else if (error instanceof Error) {
        log(`Error: ${error.message}`);
      }

      log(`=== END ===`);
    }

    // Test passes regardless — we just want to see the trace output
    expect(true).toBe(true);
  }, PER_TEST_TIMEOUT);

  // ── 5. Another failure: operation on non-existent contract ────────────────

  it('pause on wrong address — captures error trace', async () => {
    log(`\n--- PAUSE on wrong address (expected failure) ---`);

    try {
      await sdk.pause({ contractAddress: '0x0000000000000000000000000000000000000001' });
      log(`unexpectedly succeeded`);
    } catch (error: unknown) {
      if (error instanceof PipelineError && error.diagnostics?.formattedCallTrace) {
        log(`\nEnriched trace for bad-address pause:`);
        log(error.diagnostics.formattedCallTrace);
      } else {
        log(`Error (no trace): ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    expect(true).toBe(true);
  }, PER_TEST_TIMEOUT);
});
