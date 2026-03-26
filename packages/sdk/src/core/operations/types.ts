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

import { ExecutionMode } from '../types/ExecutionMode.js';
import { OperationOutcome } from '../types/ExecutionContext.js';

// ── Base params for all command handlers ─────────────────────────────────
export interface OperationParams {
  /** EVM address of the stablecoin proxy (0x...) */
  contractAddress?: string;
  /** Custom gas (optional, overrides the handler default) */
  gas?: number;
}

// ── Base result for commands ─────────────────────────────────────────────
export interface OperationResult extends OperationOutcome {
  success: boolean;
  transactionId?: string;
}

// ── Base params and result for queries ───────────────────────────────────
export interface QueryParams {
  /** EVM address of the stablecoin proxy */
  contractAddress: string;
}

export interface QueryResult {
  success: boolean;
}

// ── Reusable specific params ─────────────────────────────────────────────

/** Operations that only need an amount (burn, rescue, rescueHBAR) */
export interface AmountParams extends OperationParams {
  amount: string;
}

/** Operations that need a targetId (freeze, unfreeze, grantKyc, revokeKyc) */
export interface TargetParams extends OperationParams {
  targetId: string;
}

/** Operations that need targetId + amount (cashIn, wipe) */
export interface TargetAmountParams extends OperationParams {
  targetId: string;
  amount: string;
}

/** Role operations (grantRole, revokeRole) */
export interface RoleParams extends OperationParams {
  targetId: string;
  role: string;  // bytes32 of the role
}

/** Result with amount (burn, cashIn, wipe, etc.) */
export interface AmountResult extends OperationResult {
  amount: string;
}

/** Result with targetId + amount */
export interface TargetAmountResult extends OperationResult {
  targetId: string;
  amount: string;
}

// ── Hold-specific params ─────────────────────────────────────────────────

/** createHold — maps to HoldManagementFacet.createHold(HoldStruct) */
export interface CreateHoldParams extends OperationParams {
  amount: string;
  expirationTimestamp: string;   // epoch timestamp (uint256)
  escrowAddress: string;         // EVM address of escrow (notary)
  toAddress?: string;            // EVM address of recipient (0x0 if none)
}

/** Hold identifier — shared by executeHold, releaseHold, reclaimHold */
export interface HoldIdentifierParams extends OperationParams {
  tokenHolder: string;           // EVM address of the token holder
  holdId: string;                // hold ID (uint256)
}

/** executeHold — needs holdIdentifier + target + amount */
export interface ExecuteHoldParams extends HoldIdentifierParams {
  toAddress?: string;
  amount: string;
}

/** releaseHold — needs holdIdentifier + amount */
export interface ReleaseHoldParams extends HoldIdentifierParams {
  amount: string;
}

/** reclaimHold — only needs holdIdentifier */
export type ReclaimHoldParams = HoldIdentifierParams;

// ── Transfer-specific params ─────────────────────────────────────────────

export interface TransferParams extends OperationParams {
  tokenAddress: string;
  fromId: string;
  targetId: string;
  amount: string;
}

export interface TransferResult extends OperationResult {
  fromId: string;
  targetId: string;
  amount: string;
}

// ── Reserve-specific params ──────────────────────────────────────────────

export interface ReserveAddressParams extends OperationParams {
  reserveAddress: string;
}

// ── Create params and result ─────────────────────────────────────────────

export interface KeyDef {
  keyType: bigint;
  publicKey: string;
  isEd25519: boolean;
}

export interface RoleDef {
  role: string;
  account: string;
}

export interface CashinRoleDef {
  account: string;
  allowance: bigint;
}

export interface CreateStableCoinParams extends OperationParams {
  name: string;
  symbol: string;
  decimals?: number;               // default 6
  initialSupply?: string;          // default '0'
  maxSupply?: string;              // default '0' (infinite)
  finite?: boolean;                // supply type — true = FINITE, false = INFINITE (default)
  factoryAddress: string;          // factory EVM address
  resolverAddress: string;         // resolver EVM address
  signerAddress: string;           // who gets roles + cashin
  freeze?: boolean;                // default false
  createReserve?: boolean;         // default false
  reserveAddress?: string;         // default 0x0
  reserveInitialAmount?: string;   // default '0'
  updatedAtThreshold?: string;     // default '0'
  metadata?: string;               // default ''
  keys?: KeyDef[];
  roles?: RoleDef[];
  cashinRole?: CashinRoleDef;
  configId?: string;               // resolver proxy config key (default: 0x...02)
  configVersion?: number;          // resolver proxy config version (default: 1)
  reserveConfigId?: string;        // reserve resolver proxy config key (default: 0x...03)
  reserveConfigVersion?: number;   // reserve resolver proxy config version (default: 0)
}

export interface CreateStableCoinResult extends OperationResult {
  proxyAddress: string;
  tokenAddress: string;
  reserveProxy: string;
}

// ── CreateHoldByController params ────────────────────────────────────────

export interface CreateHoldByControllerParams extends OperationParams {
  sourceAddress: string;       // EVM address of the source (token holder)
  amount: string;              // amount in smallest unit
  expirationTimestamp: string; // epoch timestamp
  escrowAddress: string;       // EVM address of escrow
  toAddress: string;           // EVM address of recipient (0x0 if none)
}

// ── Update token params ─────────────────────────────────────────────────

export interface UpdateTokenParams extends OperationParams {
  tokenName?: string;
  tokenSymbol?: string;
  keys?: KeyDef[];
  second?: number;            // expiration in seconds (-1 = no change)
  autoRenewPeriod?: number;   // -1 = no change
  tokenMetadataURI?: string;
}

// ── Custom fees params ──────────────────────────────────────────────────

export interface UpdateCustomFeesParams extends OperationParams {
  fixedFees: Array<{
    amount: number;
    tokenId: string;
    useHbarsForPayment: boolean;
    useCurrentTokenForPayment: boolean;
    feeCollector: string;
  }>;
  fractionalFees: Array<{
    numerator: number;
    denominator: number;
    minimumAmount: number;
    maximumAmount: number;
    netOfTransfers: boolean;
    feeCollector: string;
  }>;
}

// ── Hold types for queries ───────────────────────────────────────────────

export interface HoldData {
  holdId: string;
  recipient: string;
  notary: string;
  amount: string;
  expiration: string;
  releaseTime: string;
}

// ── Bytes32 utility ──────────────────────────────────────────────────────

/** Ensures a hex value is exactly 32 bytes (64 hex chars + 0x prefix) */
export function ensureBytes32(hex: string): Buffer {
  const clean = hex.replace('0x', '');
  if (clean.length > 64) {
    throw new Error('Bytes32 value exceeds 32 bytes');
  }
  const padded = clean.padStart(64, '0');
  return Buffer.from(padded, 'hex');
}
