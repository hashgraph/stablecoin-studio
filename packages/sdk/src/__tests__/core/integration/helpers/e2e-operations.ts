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

/* eslint-disable jest/no-export */
import {
  Client,
  TokenAssociateTransaction,
} from '@hiero-ledger/sdk';
import { StableCoinSDK } from '../../../../core/StableCoinSDK.js';
import {
  ROLES,
  ROLE_NAMES,
  delay,
  logHeader,
  logResult,
  parseTokenId,
  type OpSummary,
} from './e2e-helpers.js';

export interface E2EContext {
  sdk: StableCoinSDK;
  operatorEvm: string;
  /** Hedera account ID of the operator (e.g. '0.0.12345'). Falls back to HEDERA_OPERATOR_ID env var. */
  operatorAccountId?: string;
  hederaClient: Client;
  proxyAddress: string;
  tokenAddress: string;
  /** Prefix for log headers (e.g. 'EVM', undefined for Hedera) */
  logPrefix?: string;
  /** Summary collector for mirror node event fetching */
  summary?: OpSummary[];
  /** Per-test timeout (default 60s for Hedera, 120s for EVM) */
  timeout: number;
}

/**
 * Registers the common stablecoin operation tests.
 * Both Hedera and EVM paths execute the same operations via sdk.*().
 */
export function registerCommonOperations(ctx: E2EContext): void {
  const log = (label: string) => logHeader(label, ctx.logPrefix);
  const result = (label: string, res: any) => logResult(label, res, ctx.summary);

  // ── Create ────────────────────────────────────────────────────────────

  it('create — deploy stablecoin via factory', async () => {
    if (process.env.HEDERA_TOKEN_ADDRESS) {
      ctx.proxyAddress = process.env.HEDERA_TOKEN_ADDRESS;
      console.log(`  Skipping create — using existing: ${ctx.proxyAddress}`);
      ctx.summary?.push({ op: 'create (skipped)', success: true, txId: '', events: [`existing: ${ctx.proxyAddress}`] });
      return;
    }

    log('CREATE');
    const factoryAddress = process.env.HEDERA_FACTORY_ADDRESS!;
    const resolverAddress = process.env.HEDERA_RESOLVER_ADDRESS!;

    console.log(`  factory:  ${factoryAddress}`);
    console.log(`  resolver: ${resolverAddress}`);
    console.log(`  signer:   ${ctx.operatorEvm}`);

    const res = await ctx.sdk.create({
      name: `E2E-${Date.now()}`,
      symbol: 'E2ET',
      factoryAddress,
      resolverAddress,
      signerAddress: ctx.operatorEvm,
      keys: [
        { keyType: 17n,  publicKey: '0x', isEd25519: false }, // admin + supply
        { keyType: 110n, publicKey: '0x', isEd25519: false }, // kyc + freeze + wipe + fee_schedule + pause
      ],
    });

    expect(res.success).toBe(true);
    expect(res.proxyAddress).toBeTruthy();
    ctx.proxyAddress = res.proxyAddress;
    ctx.tokenAddress = res.tokenAddress;
    await result('create', res);
  }, ctx.timeout);

  // ── Associate (operator — native HTS) ─────────────────────────────────

  it('associate — operator associates with HTS token', async () => {
    log('TOKEN ASSOCIATE (operator)');

    // Resolve tokenAddress from mirror node if using existing token
    if (!ctx.tokenAddress && ctx.proxyAddress) {
      try {
        const res = await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/contracts/${ctx.proxyAddress}`,
        );
        const data = await res.json() as any;
        ctx.tokenAddress = data.evm_address ?? ctx.proxyAddress;
      } catch {
        ctx.tokenAddress = ctx.proxyAddress;
      }
    }

    const tokenId = parseTokenId(ctx.tokenAddress);
    if (!tokenId) {
      console.log(`  Could not parse tokenAddress=${ctx.tokenAddress}, skipping`);
      ctx.summary?.push({ op: 'associate (skipped)', success: true, txId: '', events: [] });
      return;
    }

    console.log(`  tokenId: ${tokenId}`);
    try {
      const accountId = ctx.operatorAccountId ?? process.env.HEDERA_OPERATOR_ID!;
      const tx = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId]);
      const response = await tx.execute(ctx.hederaClient);
      const receipt = await response.getReceipt(ctx.hederaClient);
      console.log(`  OK | txId: ${response.transactionId}`);
      console.log(`  OK | status: ${receipt.status}`);
      ctx.summary?.push({ op: 'associate (operator)', success: true, txId: response.transactionId.toString(), events: [] });
    } catch (e: any) {
      if (e.message?.includes('TOKEN_ALREADY_ASSOCIATED')) {
        console.log('  Already associated — OK');
        ctx.summary?.push({ op: 'associate (operator, already)', success: true, txId: '', events: [] });
      } else {
        throw e;
      }
    }
  }, ctx.timeout);

  // ── Pause / Unpause ────────────────────────────────────────────────────

  it('pause', async () => {
    log('PAUSE');
    const res = await ctx.sdk.pause({ contractAddress: ctx.proxyAddress });
    expect(res.success).toBe(true);
    await result('pause', res);
  }, ctx.timeout);

  it('unpause', async () => {
    log('UNPAUSE');
    const res = await ctx.sdk.unpause({ contractAddress: ctx.proxyAddress });
    expect(res.success).toBe(true);
    await result('unpause', res);
  }, ctx.timeout);

  // ── KYC ────────────────────────────────────────────────────────────────

  it('grantKyc — operator', async () => {
    log('GRANT KYC (operator)');
    const res = await ctx.sdk.grantKyc({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('grantKyc (operator)', res);
  }, ctx.timeout);

  // ── Supply — cashIn / wipe ─────────────────────────────────────────────
  // Note: burn is NOT tested here because the operator has admin role, and
  // admin cashIn does NOT track burnableAmount (contract design). Burn is
  // tested in HederaE2E with account2 (non-admin) where supplier cashIn works.

  it('cashIn — mint 1000 tokens to operator', async () => {
    log('CASH IN (operator)');
    const res = await ctx.sdk.cashIn({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      amount: '1000000000', // 1000 tokens (6 decimals)
    });
    expect(res.success).toBe(true);
    await result('cashIn (operator, 1000)', res);
  }, ctx.timeout);

  // ── Queries (after cashIn — operator has balance + roles) ──────────────
  // Note: Hashio relay lags ~5-10s behind Hedera consensus, so recent
  // transaction results may not be visible yet. We only assert success
  // and field existence, not specific values from recent operations.

  it('query: getBalance — operator balance', async () => {
    log('QUERY: getBalance');
    const res = await ctx.sdk.getBalance({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    const balance = (res as any).balance;
    console.log(`  balance: ${balance}`);
    expect(balance).toBeDefined();
  }, ctx.timeout);

  it('query: getBurnableAmount', async () => {
    log('QUERY: getBurnableAmount');
    const res = await ctx.sdk.getBurnableAmount({ contractAddress: ctx.proxyAddress });
    expect(res.success).toBe(true);
    console.log(`  burnableAmount: ${(res as any).amount}`);
  }, ctx.timeout);

  it('query: getReserveAddress', async () => {
    log('QUERY: getReserveAddress');
    const res = await ctx.sdk.getReserveAddress({ contractAddress: ctx.proxyAddress });
    expect(res.success).toBe(true);
    console.log(`  reserveAddress: ${(res as any).reserveAddress}`);
  }, ctx.timeout);

  it('query: getReserveAmount', async () => {
    log('QUERY: getReserveAmount');
    const res = await ctx.sdk.getReserveAmount({ contractAddress: ctx.proxyAddress });
    expect(res.success).toBe(true);
    console.log(`  reserveAmount: ${(res as any).amount}`);
  }, ctx.timeout);

  it('query: hasRole — operator has cashin role', async () => {
    log('QUERY: hasRole');
    const res = await ctx.sdk.hasRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.cashin,
    });
    expect(res.success).toBe(true);
    console.log(`  hasRole (cashin): ${(res as any).hasRole}`);
    expect((res as any).hasRole).toBe(true);
  }, ctx.timeout);

  it('query: getRoles — operator roles', async () => {
    log('QUERY: getRoles');
    const res = await ctx.sdk.getRoles({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    const roles = (res as any).roles as string[];
    console.log(`  roles (${roles.length}): ${roles.map(r => ROLE_NAMES[r] ?? r.slice(0, 10)).join(', ')}`);
    expect(roles.length).toBeGreaterThan(0);
  }, ctx.timeout);

  it('query: getAccountsWithRole — who has cashin', async () => {
    log('QUERY: getAccountsWithRole');
    const res = await ctx.sdk.getAccountsWithRole({
      contractAddress: ctx.proxyAddress,
      role: ROLES.cashin,
    });
    expect(res.success).toBe(true);
    const accounts = (res as any).accounts as string[];
    console.log(`  accounts with cashin: ${accounts.length}`);
    expect(accounts.length).toBeGreaterThan(0);
  }, ctx.timeout);

  it('query: isUnlimited — operator (should be false, default supplier)', async () => {
    log('QUERY: isUnlimited');
    const res = await ctx.sdk.isUnlimited({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    console.log(`  isUnlimited: ${(res as any).isUnlimited}`);
  }, ctx.timeout);

  // ── Wipe ────────────────────────────────────────────────────────────────

  it('wipe — wipe 5 tokens from operator', async () => {
    log('WIPE');
    const res = await ctx.sdk.wipe({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      amount: '5000000', // 5 tokens
    });
    expect(res.success).toBe(true);
    await result('wipe (5)', res);
  }, ctx.timeout);

  // ── Rescue — grant role, transfer, rescue, revoke ─────────────────────

  it('grantRole — grant RESCUE role to operator', async () => {
    log('GRANT ROLE (rescue)');
    const res = await ctx.sdk.grantRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.rescue,
    });
    expect(res.success).toBe(true);
    await result('grantRole (rescue)', res);
  }, ctx.timeout);

  it('transfer — send 10 tokens to contract (prep for rescue)', async () => {
    log('TRANSFER (to contract for rescue)');
    const HTS_PRECOMPILE = '0x0000000000000000000000000000000000000167';
    const res = await ctx.sdk.transfer({
      contractAddress: HTS_PRECOMPILE,
      tokenAddress: ctx.tokenAddress,
      fromId: ctx.operatorEvm,
      targetId: ctx.proxyAddress,
      amount: '10000000', // 10 tokens (6 decimals)
    });
    expect(res.success).toBe(true);
    await result('transfer (10 → contract)', res);
  }, ctx.timeout);

  it('rescue — rescue 10 tokens from contract', async () => {
    log('RESCUE');
    const res = await ctx.sdk.rescue({
      contractAddress: ctx.proxyAddress,
      amount: '10000000',
    });
    expect(res.success).toBe(true);
    await result('rescue (10)', res);
  }, ctx.timeout);

  it('revokeRole — revoke RESCUE role from operator', async () => {
    log('REVOKE ROLE (rescue)');
    const res = await ctx.sdk.revokeRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.rescue,
    });
    expect(res.success).toBe(true);
    await result('revokeRole (rescue)', res);
  }, ctx.timeout);

  // ── Freeze / Unfreeze ──────────────────────────────────────────────────

  it('freeze — freeze operator account', async () => {
    log('FREEZE');
    const res = await ctx.sdk.freeze({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('freeze', res);
  }, ctx.timeout);

  it('unfreeze — unfreeze operator account', async () => {
    log('UNFREEZE');
    const res = await ctx.sdk.unfreeze({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('unfreeze', res);
  }, ctx.timeout);

  // ── RevokeKyc (then re-grant for subsequent operations) ────────────────

  it('revokeKyc — revoke KYC from operator', async () => {
    log('REVOKE KYC');
    const res = await ctx.sdk.revokeKyc({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('revokeKyc', res);
  }, ctx.timeout);

  it('grantKyc — re-grant KYC to operator', async () => {
    log('GRANT KYC (re-grant)');
    const res = await ctx.sdk.grantKyc({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('grantKyc (re-grant)', res);
  }, ctx.timeout);

  // ── Supplier roles & allowance ─────────────────────────────────────────

  it('revokeSupplierRole — revoke default from create', async () => {
    log('REVOKE SUPPLIER ROLE (default)');
    const res = await ctx.sdk.revokeSupplierRole({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('revokeSupplierRole (default)', res);
  }, ctx.timeout);

  it('grantSupplierRole — with 500 token allowance', async () => {
    log('GRANT SUPPLIER ROLE');
    const res = await ctx.sdk.grantSupplierRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      amount: '500000000',
    });
    expect(res.success).toBe(true);
    await result('grantSupplierRole', res);
  }, ctx.timeout);

  it('query: getAllowance — check supplier allowance', async () => {
    log('QUERY: getAllowance');
    const res = await ctx.sdk.getAllowance({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    console.log(`  allowance: ${(res as any).allowance}`);
  }, ctx.timeout);

  it('increaseAllowance — increase by 200 tokens', async () => {
    log('INCREASE ALLOWANCE');
    const res = await ctx.sdk.increaseAllowance({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      amount: '200000000',
    });
    expect(res.success).toBe(true);
    await result('increaseAllowance', res);
  }, ctx.timeout);

  it('decreaseAllowance — decrease by 100 tokens', async () => {
    log('DECREASE ALLOWANCE');
    const res = await ctx.sdk.decreaseAllowance({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      amount: '100000000',
    });
    expect(res.success).toBe(true);
    await result('decreaseAllowance', res);
  }, ctx.timeout);

  it('resetAllowance — reset to 0', async () => {
    log('RESET ALLOWANCE');
    const res = await ctx.sdk.resetAllowance({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('resetAllowance', res);
  }, ctx.timeout);

  it('revokeSupplierRole — final', async () => {
    log('REVOKE SUPPLIER ROLE');
    const res = await ctx.sdk.revokeSupplierRole({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('revokeSupplierRole', res);
  }, ctx.timeout);

  it('grantUnlimitedSupplierRole', async () => {
    log('GRANT UNLIMITED SUPPLIER ROLE');
    const res = await ctx.sdk.grantUnlimitedSupplierRole({ contractAddress: ctx.proxyAddress, targetId: ctx.operatorEvm });
    expect(res.success).toBe(true);
    await result('grantUnlimitedSupplierRole', res);
  }, ctx.timeout);

  // ── Multi-role operations ──────────────────────────────────────────────

  it('revokeMultiRoles — revoke burn+wipe from operator', async () => {
    log('REVOKE MULTI ROLES');
    const res = await ctx.sdk.revokeMultiRoles({
      contractAddress: ctx.proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [ctx.operatorEvm, ctx.operatorEvm],
    });
    expect(res.success).toBe(true);
    await result('revokeMultiRoles (burn+wipe)', res);
  }, ctx.timeout);

  it('grantMultiRoles — re-grant burn+wipe to operator', async () => {
    log('GRANT MULTI ROLES');
    const UINT256_MAX = ((1n << 256n) - 1n).toString();
    const res = await ctx.sdk.grantMultiRoles({
      contractAddress: ctx.proxyAddress,
      roles: [ROLES.burn, ROLES.wipe],
      accounts: [ctx.operatorEvm, ctx.operatorEvm],
      amounts: [UINT256_MAX, UINT256_MAX],
    });
    expect(res.success).toBe(true);
    await result('grantMultiRoles (burn+wipe)', res);
  }, ctx.timeout);

  // ── Hold operations ────────────────────────────────────────────────────

  it('grantRole — grant HOLD role to operator', async () => {
    log('GRANT ROLE (hold)');
    const res = await ctx.sdk.grantRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.hold,
    });
    expect(res.success).toBe(true);
    await result('grantRole (hold)', res);
  }, ctx.timeout);

  let holdIdForTest: string;

  it('createHold — create a hold for 100 tokens', async () => {
    log('CREATE HOLD');
    // Expiration: 1 hour from now
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const res = await ctx.sdk.createHold({
      contractAddress: ctx.proxyAddress,
      amount: '100000000', // 100 tokens (6 decimals)
      expirationTimestamp: expiration.toString(),
      escrowAddress: ctx.operatorEvm, // operator is the escrow/notary
    });
    expect(res.success).toBe(true);
    // The holdId comes from the contract event — default is 1 for first hold
    holdIdForTest = '1';
    await result('createHold (100)', res);
  }, ctx.timeout);

  // ── Hold queries (after createHold) ──────────────────────────────────
  // Note: Hashio relay may not have indexed the hold yet. We verify
  // the query infrastructure works (success: true), not the indexed values.

  it('query: getHeldAmount — operator held amount', async () => {
    log('QUERY: getHeldAmount');
    const res = await ctx.sdk.getHeldAmount({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    console.log(`  heldAmount: ${(res as any).amount}`);
  }, ctx.timeout);

  it('query: getHoldCount — operator hold count', async () => {
    log('QUERY: getHoldCount');
    const res = await ctx.sdk.getHoldCount({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    console.log(`  holdCount: ${(res as any).count}`);
  }, ctx.timeout);

  it('query: getHoldsId — operator hold IDs', async () => {
    log('QUERY: getHoldsId');
    const res = await ctx.sdk.getHoldsId({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      start: '0',
      end: '10',
    });
    expect(res.success).toBe(true);
    console.log(`  holdIds: ${JSON.stringify((res as any).holdIds)}`);
  }, ctx.timeout);

  it('executeHold — execute the hold (partial: 50 tokens)', async () => {
    log('EXECUTE HOLD');
    const res = await ctx.sdk.executeHold({
      contractAddress: ctx.proxyAddress,
      tokenHolder: ctx.operatorEvm,
      holdId: holdIdForTest,
      toAddress: ctx.operatorEvm, // transfer back to operator
      amount: '50000000', // 50 tokens
    });
    expect(res.success).toBe(true);
    await result('executeHold (50)', res);
  }, ctx.timeout);

  it('createHold — create another hold for releaseHold test', async () => {
    log('CREATE HOLD (for release)');
    const expiration = Math.floor(Date.now() / 1000) + 3600;
    const res = await ctx.sdk.createHold({
      contractAddress: ctx.proxyAddress,
      amount: '10000000', // 10 tokens
      expirationTimestamp: expiration.toString(),
      escrowAddress: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    await result('createHold (10, for release)', res);
  }, ctx.timeout);

  it('releaseHold — release the second hold', async () => {
    log('RELEASE HOLD');
    const res = await ctx.sdk.releaseHold({
      contractAddress: ctx.proxyAddress,
      tokenHolder: ctx.operatorEvm,
      holdId: '2', // second hold created
      amount: '10000000',
    });
    expect(res.success).toBe(true);
    await result('releaseHold', res);
  }, ctx.timeout);

  it('createHold — create another hold for reclaimHold test (short expiry)', async () => {
    log('CREATE HOLD (for reclaim, 10s expiry)');
    // Short expiration so we can test reclaimHold after it expires
    const expiration = Math.floor(Date.now() / 1000) + 10;
    const res = await ctx.sdk.createHold({
      contractAddress: ctx.proxyAddress,
      amount: '5000000', // 5 tokens
      expirationTimestamp: expiration.toString(),
      escrowAddress: ctx.operatorEvm,
    });
    expect(res.success).toBe(true);
    await result('createHold (5, for reclaim)', res);
  }, ctx.timeout);

  it('reclaimHold — wait for expiry then reclaim the third hold', async () => {
    log('RECLAIM HOLD (waiting for hold to expire...)');
    // Wait for the hold to expire (created with ~10s expiry, wait 15s to be safe)
    await delay(15_000);
    console.log('  Hold expired, reclaiming...');
    const res = await ctx.sdk.reclaimHold({
      contractAddress: ctx.proxyAddress,
      tokenHolder: ctx.operatorEvm,
      holdId: '3', // third hold created
    });
    expect(res.success).toBe(true);
    await result('reclaimHold', res);
  }, ctx.timeout);

  it('revokeRole — revoke HOLD role from operator', async () => {
    log('REVOKE ROLE (hold)');
    const res = await ctx.sdk.revokeRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.hold,
    });
    expect(res.success).toBe(true);
    await result('revokeRole (hold)', res);
  }, ctx.timeout);

  // ── Update token ──────────────────────────────────────────────────────

  it('updateToken — change metadata URI', async () => {
    log('UPDATE TOKEN');
    const res = await ctx.sdk.updateToken({
      contractAddress: ctx.proxyAddress,
      tokenMetadataURI: 'https://example.com/metadata.json',
    });
    expect(res.success).toBe(true);
    await result('updateToken', res);
  }, ctx.timeout);

  // ── Custom fees ──────────────────────────────────────────────────────

  it('grantRole — grant CUSTOM_FEES role to operator', async () => {
    log('GRANT ROLE (customFees)');
    const res = await ctx.sdk.grantRole({
      contractAddress: ctx.proxyAddress,
      targetId: ctx.operatorEvm,
      role: ROLES.customFees,
    });
    expect(res.success).toBe(true);
    await result('grantRole (customFees)', res);
  }, ctx.timeout);

  it('updateCustomFees — add fixed + fractional fee', async () => {
    log('UPDATE CUSTOM FEES');
    const res = await ctx.sdk.updateCustomFees({
      contractAddress: ctx.proxyAddress,
      fixedFees: [{
        amount: 1_000_000,      // 1 token (6 decimals)
        tokenId: ctx.tokenAddress,
        useHbarsForPayment: false,
        useCurrentTokenForPayment: true,
        feeCollector: ctx.operatorEvm,
      }],
      fractionalFees: [{
        numerator: 1,
        denominator: 100,       // 1%
        minimumAmount: 100_000, // 0.1 token min
        maximumAmount: 10_000_000, // 10 tokens max
        netOfTransfers: false,
        feeCollector: ctx.operatorEvm,
      }],
    });
    expect(res.success).toBe(true);
    await result('updateCustomFees', res);
  }, ctx.timeout);

  it('updateCustomFees — clear all fees', async () => {
    log('UPDATE CUSTOM FEES (clear)');
    const res = await ctx.sdk.updateCustomFees({
      contractAddress: ctx.proxyAddress,
      fixedFees: [],
      fractionalFees: [],
    });
    expect(res.success).toBe(true);
    await result('updateCustomFees (clear)', res);
  }, ctx.timeout);
}
