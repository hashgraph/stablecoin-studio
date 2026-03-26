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

import {
  Client,
  Transaction,
} from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import {
  isConfigured,
  isEd25519Key,
  parsePrivateKey,
  resolveOperatorEvm,
  ROLES,
} from './helpers/e2e-helpers.js';

// ── Guards ────────────────────────────────────────────────────────────────────

const hasToken = () => isConfigured() && !!process.env.HEDERA_TOKEN_ADDRESS;
const describeFn = hasToken() ? describe : describe.skip;
const TIMEOUT = 60_000;

// dummy addresses for params that won't be submitted
const DUMMY_RESERVE = '0x0000000000000000000000000000000000000001';
const DUMMY_RESOLVER = '0x0000000000000000000000000000000000000002';
const UINT256_MAX = ((1n << 256n) - 1n).toString();

// ── Hedera External ─────────────────────────────────────────────────────────

describeFn('Hedera External — serialization only (no on-chain submission)', () => {
  let sdk: StableCoinSDK;
  let proxyAddress: string;
  let operatorEvm: string;

  beforeAll(() => {
    const privateKeyStr = process.env.HEDERA_PRIVATE_KEY!;
    const operatorId = process.env.HEDERA_OPERATOR_ID!;
    const privateKey = parsePrivateKey(privateKeyStr);

    const client = Client.forTestnet();
    client.setOperatorWith(
      operatorId,
      privateKey.publicKey,
      async (msg: Uint8Array) => privateKey.sign(msg),
    );

    proxyAddress = process.env.HEDERA_TOKEN_ADDRESS!;
    operatorEvm = resolveOperatorEvm(privateKeyStr, operatorId);

    sdk = new StableCoinSDK({
      network: 'testnet',
      signing: {
        type: 'hedera-external',
        client,
        sign: async () => new Uint8Array(), // never called — pipeline doesn't sign
      },
    });

    const ed = isEd25519Key(privateKeyStr) ? 'ED25519' : 'ECDSA';
    console.log(`\n[Hedera External] Operator: ${operatorId} (${ed})`);
    console.log(`  Pipeline: BuildHedera → SerializeHedera → ReturnSerialized`);
    console.log(`  Token: ${proxyAddress}`);
  });

  // ── No-arg operations ──────────────────────────────────────────────
  it('pause', async () => {
    const res = await sdk.pause({ contractAddress: proxyAddress });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('unpause', async () => {
    const res = await sdk.unpause({ contractAddress: proxyAddress });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('delete', async () => {
    const res = await sdk.delete({ contractAddress: proxyAddress });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Amount operations ──────────────────────────────────────────────
  it('burn', async () => {
    const res = await sdk.burn({ contractAddress: proxyAddress, amount: '100' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('rescue', async () => {
    const res = await sdk.rescue({ contractAddress: proxyAddress, amount: '100' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('rescueHBAR', async () => {
    const res = await sdk.rescueHBAR({ contractAddress: proxyAddress, amount: '100' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Target operations ──────────────────────────────────────────────
  it('freeze', async () => {
    const res = await sdk.freeze({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('unfreeze', async () => {
    const res = await sdk.unfreeze({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('grantKyc', async () => {
    const res = await sdk.grantKyc({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('revokeKyc', async () => {
    const res = await sdk.revokeKyc({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Target+Amount operations ───────────────────────────────────────
  it('cashIn', async () => {
    const res = await sdk.cashIn({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '1000000' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('wipe', async () => {
    const res = await sdk.wipe({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '100' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Role operations ────────────────────────────────────────────────
  it('grantRole', async () => {
    const res = await sdk.grantRole({ contractAddress: proxyAddress, targetId: operatorEvm, role: ROLES.rescue });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('revokeRole', async () => {
    const res = await sdk.revokeRole({ contractAddress: proxyAddress, targetId: operatorEvm, role: ROLES.rescue });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Supplier & Allowance operations ────────────────────────────────
  it('grantSupplierRole', async () => {
    const res = await sdk.grantSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '500000000' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('revokeSupplierRole', async () => {
    const res = await sdk.revokeSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('grantUnlimitedSupplierRole', async () => {
    const res = await sdk.grantUnlimitedSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('increaseAllowance', async () => {
    const res = await sdk.increaseAllowance({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '200000000' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('decreaseAllowance', async () => {
    const res = await sdk.decreaseAllowance({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '100000000' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('resetAllowance', async () => {
    const res = await sdk.resetAllowance({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Multi-role operations ──────────────────────────────────────────
  it('grantMultiRoles', async () => {
    const res = await sdk.grantMultiRoles({
      contractAddress: proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [operatorEvm, operatorEvm],
      amounts: [UINT256_MAX, UINT256_MAX],
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('revokeMultiRoles', async () => {
    const res = await sdk.revokeMultiRoles({
      contractAddress: proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [operatorEvm, operatorEvm],
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Update operations ──────────────────────────────────────────────
  it('updateToken', async () => {
    const res = await sdk.updateToken({
      contractAddress: proxyAddress,
      tokenMetadataURI: 'https://example.com/metadata.json',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('updateCustomFees', async () => {
    const res = await sdk.updateCustomFees({
      contractAddress: proxyAddress,
      fixedFees: [{
        amount: 1_000_000,
        tokenId: proxyAddress,
        useHbarsForPayment: false,
        useCurrentTokenForPayment: true,
        feeCollector: operatorEvm,
      }],
      fractionalFees: [{
        numerator: 1,
        denominator: 100,
        minimumAmount: 100_000,
        maximumAmount: 10_000_000,
        netOfTransfers: false,
        feeCollector: operatorEvm,
      }],
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Reserve operations ─────────────────────────────────────────────
  it('updateReserveAddress', async () => {
    const res = await sdk.updateReserveAddress({ contractAddress: proxyAddress, reserveAddress: DUMMY_RESERVE });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('updateReserveAmount', async () => {
    const res = await sdk.updateReserveAmount({ contractAddress: proxyAddress, amount: '1000' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Management operations ──────────────────────────────────────────
  it('updateConfigVersion', async () => {
    const res = await sdk.execute('updateConfigVersion', { contractAddress: proxyAddress, configVersion: '1' });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('updateConfig', async () => {
    const res = await sdk.execute('updateConfig', {
      contractAddress: proxyAddress,
      configId: '0x' + '01'.repeat(32),
      configVersion: '1',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('updateResolver', async () => {
    const res = await sdk.execute('updateResolver', {
      contractAddress: proxyAddress,
      resolver: DUMMY_RESOLVER,
      configId: '0x' + '01'.repeat(32),
      configVersion: '1',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Hold operations ──────────────────────────────────────────────
  it('createHold', async () => {
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const res = await sdk.createHold({
      contractAddress: proxyAddress,
      amount: '100000000',
      expirationTimestamp: expiration.toString(),
      escrowAddress: operatorEvm,
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('executeHold', async () => {
    const res = await sdk.executeHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
      amount: '50000000',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('releaseHold', async () => {
    const res = await sdk.releaseHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
      amount: '10000000',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  it('reclaimHold', async () => {
    const res = await sdk.reclaimHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);

  // ── Create (factory) ───────────────────────────────────────────────
  it('create', async () => {
    const res = await sdk.create({
      name: `Ext-${Date.now()}`,
      symbol: 'EXT',
      factoryAddress: process.env.HEDERA_FACTORY_ADDRESS!,
      resolverAddress: process.env.HEDERA_RESOLVER_ADDRESS!,
      signerAddress: operatorEvm,
      keys: [{ keyType: 17n, publicKey: '0x', isEd25519: false }],
    });
    expectHederaSerializedResult(res);
  }, TIMEOUT);
});

// ── EVM External ──────────────────────────────────────────────────────────────

const evmConfigured = hasToken() && !isEd25519Key(process.env.HEDERA_PRIVATE_KEY ?? '');
const evmDescribeFn = evmConfigured ? describe : describe.skip;

evmDescribeFn('EVM External — serialization only (no on-chain submission)', () => {
  let sdk: StableCoinSDK;
  let proxyAddress: string;
  let operatorEvm: string;

  beforeAll(() => {
    const privateKeyStr = process.env.HEDERA_PRIVATE_KEY!;
    const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

    proxyAddress = process.env.HEDERA_TOKEN_ADDRESS!;
    operatorEvm = new ethers.Wallet(privateKeyStr).address;

    sdk = new StableCoinSDK({
      network: 'testnet',
      signing: {
        type: 'evm-external',
        provider,
        sign: async () => new Uint8Array(), // never called — pipeline doesn't sign
      },
    });

    console.log(`\n[EVM External] Operator: ${operatorEvm}`);
    console.log(`  Pipeline: BuildEVM → SerializeEVM → ReturnSerialized`);
    console.log(`  Token: ${proxyAddress}`);
  });

  // ── No-arg operations ──────────────────────────────────────────────
  it('evm:pause', async () => {
    const res = await sdk.pause({ contractAddress: proxyAddress });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:unpause', async () => {
    const res = await sdk.unpause({ contractAddress: proxyAddress });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:delete', async () => {
    const res = await sdk.delete({ contractAddress: proxyAddress });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Amount operations ──────────────────────────────────────────────
  it('evm:burn', async () => {
    const res = await sdk.burn({ contractAddress: proxyAddress, amount: '100' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:rescue', async () => {
    const res = await sdk.rescue({ contractAddress: proxyAddress, amount: '100' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:rescueHBAR', async () => {
    const res = await sdk.rescueHBAR({ contractAddress: proxyAddress, amount: '100' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Target operations ──────────────────────────────────────────────
  it('evm:freeze', async () => {
    const res = await sdk.freeze({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:unfreeze', async () => {
    const res = await sdk.unfreeze({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:grantKyc', async () => {
    const res = await sdk.grantKyc({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:revokeKyc', async () => {
    const res = await sdk.revokeKyc({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Target+Amount operations ───────────────────────────────────────
  it('evm:cashIn', async () => {
    const res = await sdk.cashIn({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '1000000' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:wipe', async () => {
    const res = await sdk.wipe({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '100' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Role operations ────────────────────────────────────────────────
  it('evm:grantRole', async () => {
    const res = await sdk.grantRole({ contractAddress: proxyAddress, targetId: operatorEvm, role: ROLES.rescue });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:revokeRole', async () => {
    const res = await sdk.revokeRole({ contractAddress: proxyAddress, targetId: operatorEvm, role: ROLES.rescue });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Supplier & Allowance operations ────────────────────────────────
  it('evm:grantSupplierRole', async () => {
    const res = await sdk.grantSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '500000000' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:revokeSupplierRole', async () => {
    const res = await sdk.revokeSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:grantUnlimitedSupplierRole', async () => {
    const res = await sdk.grantUnlimitedSupplierRole({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:increaseAllowance', async () => {
    const res = await sdk.increaseAllowance({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '200000000' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:decreaseAllowance', async () => {
    const res = await sdk.decreaseAllowance({ contractAddress: proxyAddress, targetId: operatorEvm, amount: '100000000' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:resetAllowance', async () => {
    const res = await sdk.resetAllowance({ contractAddress: proxyAddress, targetId: operatorEvm });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Multi-role operations ──────────────────────────────────────────
  it('evm:grantMultiRoles', async () => {
    const res = await sdk.grantMultiRoles({
      contractAddress: proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [operatorEvm, operatorEvm],
      amounts: [UINT256_MAX, UINT256_MAX],
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:revokeMultiRoles', async () => {
    const res = await sdk.revokeMultiRoles({
      contractAddress: proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [operatorEvm, operatorEvm],
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Update operations ──────────────────────────────────────────────
  it('evm:updateToken', async () => {
    const res = await sdk.updateToken({
      contractAddress: proxyAddress,
      tokenMetadataURI: 'https://example.com/metadata.json',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:updateCustomFees', async () => {
    const res = await sdk.updateCustomFees({
      contractAddress: proxyAddress,
      fixedFees: [{
        amount: 1_000_000,
        tokenId: proxyAddress,
        useHbarsForPayment: false,
        useCurrentTokenForPayment: true,
        feeCollector: operatorEvm,
      }],
      fractionalFees: [{
        numerator: 1,
        denominator: 100,
        minimumAmount: 100_000,
        maximumAmount: 10_000_000,
        netOfTransfers: false,
        feeCollector: operatorEvm,
      }],
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Reserve operations ─────────────────────────────────────────────
  it('evm:updateReserveAddress', async () => {
    const res = await sdk.updateReserveAddress({ contractAddress: proxyAddress, reserveAddress: DUMMY_RESERVE });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:updateReserveAmount', async () => {
    const res = await sdk.updateReserveAmount({ contractAddress: proxyAddress, amount: '1000' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Management operations ──────────────────────────────────────────
  it('evm:updateConfigVersion', async () => {
    const res = await sdk.execute('updateConfigVersion', { contractAddress: proxyAddress, configVersion: '1' });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:updateConfig', async () => {
    const res = await sdk.execute('updateConfig', {
      contractAddress: proxyAddress,
      configId: '0x' + '01'.repeat(32),
      configVersion: '1',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:updateResolver', async () => {
    const res = await sdk.execute('updateResolver', {
      contractAddress: proxyAddress,
      resolver: DUMMY_RESOLVER,
      configId: '0x' + '01'.repeat(32),
      configVersion: '1',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  // ── Hold operations ──────────────────────────────────────────────
  it('evm:createHold', async () => {
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const res = await sdk.createHold({
      contractAddress: proxyAddress,
      amount: '100000000',
      expirationTimestamp: expiration.toString(),
      escrowAddress: operatorEvm,
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:executeHold', async () => {
    const res = await sdk.executeHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
      amount: '50000000',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:releaseHold', async () => {
    const res = await sdk.releaseHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
      amount: '10000000',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);

  it('evm:reclaimHold', async () => {
    const res = await sdk.reclaimHold({
      contractAddress: proxyAddress,
      tokenHolder: operatorEvm,
      holdId: '1',
    });
    expectEVMSerializedResult(res);
  }, TIMEOUT);
});

// ── Assertion helpers ─────────────────────────────────────────────────────────

function expectHederaSerializedResult(res: any): void {
  expect(res.success).toBe(true);
  expect(res.transactionBytes).toBeInstanceOf(Uint8Array);
  expect(res.transactionBytes.length).toBeGreaterThan(0);

  const deserialized = Transaction.fromBytes(res.transactionBytes);
  expect(deserialized).toBeDefined();
  console.log(`    ✓ ${res.transactionBytes.length} bytes → Transaction.fromBytes() OK`);

  expect(res.transactionId).toBeUndefined();
}

function expectEVMSerializedResult(res: any): void {
  expect(res.success).toBe(true);
  expect(res.transactionBytes).toBeInstanceOf(Uint8Array);
  expect(res.transactionBytes.length).toBeGreaterThan(0);

  const hex = ethers.hexlify(res.transactionBytes);
  const parsed = ethers.Transaction.from(hex);
  expect(parsed).toBeDefined();
  expect(parsed.to).toBeTruthy();
  console.log(`    ✓ ${res.transactionBytes.length} bytes → ethers.Transaction.from() OK → to: ${parsed.to}`);

  expect(res.transactionId).toBeUndefined();
}
