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

import { AccountId } from '@hiero-ledger/sdk';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';

const REQUIRED_ENV = [
  'HEDERA_NETWORK',
  'HEDERA_OPERATOR_ID',
  'HEDERA_PRIVATE_KEY',
  'HEDERA_FACTORY_ADDRESS',
  'HEDERA_RESOLVER_ADDRESS',
];

const isConfigured = REQUIRED_ENV.every((key) => !!process.env[key]);

/** Accepts both EVM address (0x...) and Hedera ID (0.0.xxxxx). */
function toEvmAddress(addr: string): string {
  if (addr.startsWith('0x')) return addr;
  return '0x' + AccountId.fromString(addr).toSolidityAddress();
}

const describeFn = isConfigured ? describe : describe.skip;

describeFn('Deploy StableCoin — testnet smoke test', () => {
  it('deploy — creates a stablecoin via factory', async () => {
    console.log('\n=== TRACE: Starting deploy test ===');
    console.log(`  [env] HEDERA_NETWORK=${process.env.HEDERA_NETWORK}`);
    console.log(`  [env] HEDERA_OPERATOR_ID=${process.env.HEDERA_OPERATOR_ID}`);
    console.log(`  [env] HEDERA_PRIVATE_KEY=${process.env.HEDERA_PRIVATE_KEY?.slice(0, 10)}...`);
    console.log(`  [env] HEDERA_FACTORY_ADDRESS=${process.env.HEDERA_FACTORY_ADDRESS}`);
    console.log(`  [env] HEDERA_RESOLVER_ADDRESS=${process.env.HEDERA_RESOLVER_ADDRESS}`);

    console.log('\n  [trace] Creating SDK via fromEnvironment()...');
    const sdk = StableCoinSDK.fromEnvironment();
    console.log('  [trace] SDK created OK');

    const signerAddress = toEvmAddress(process.env.HEDERA_OPERATOR_ID!);
    const factoryAddress = toEvmAddress(process.env.HEDERA_FACTORY_ADDRESS!);
    const resolverAddress = toEvmAddress(process.env.HEDERA_RESOLVER_ADDRESS!);

    console.log(`  [deploy] signerAddress:   ${signerAddress}`);
    console.log(`  [deploy] factoryAddress:  ${factoryAddress}`);
    console.log(`  [deploy] resolverAddress: ${resolverAddress}`);

    const createParams = {
      name: `DeployTest-${Date.now()}`,
      symbol: 'DPT',
      factoryAddress,
      resolverAddress,
      signerAddress,
    };
    console.log('  [trace] Create params:', JSON.stringify(createParams, null, 2));

    console.log('\n  [trace] Calling sdk.create()...');
    try {
      const result = await sdk.create(createParams);

      console.log('\n=== TRACE: Deploy result ===');
      console.log(`  [deploy] success:      ${result.success}`);
      console.log(`  [deploy] txId:         ${result.transactionId}`);
      console.log(`  [deploy] proxyAddress: ${result.proxyAddress}`);
      console.log(`  [deploy] tokenAddress: ${result.tokenAddress}`);
      console.log(`  [deploy] reserveProxy: ${result.reserveProxy}`);

      expect(result.success).toBe(true);
      expect(result.proxyAddress).toBeTruthy();
    } catch (error: any) {
      console.error('\n=== TRACE: Deploy FAILED ===');
      console.error(`  [error] name:    ${error.name}`);
      console.error(`  [error] message: ${error.message}`);
      console.error(`  [error] stack:   ${error.stack}`);
      if (error.status) console.error(`  [error] status:  ${error.status}`);
      if (error.transactionId) console.error(`  [error] txId:    ${error.transactionId}`);
      throw error;
    }
  }, 120_000);
});
