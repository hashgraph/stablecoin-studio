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
import { TransactionResultLike } from '../types/PipelineContext.js';

// ── Params base para todos los command handlers ────────────────────────
export interface CommandParams {
  /** Dirección EVM del proxy del stablecoin (0x...) */
  contractAddress?: string;
  /** Gas personalizado (opcional, override del default del handler) */
  gas?: number;
}

// ── Resultado base para commands ───────────────────────────────────────
export interface TransactionResult extends TransactionResultLike {
  success: boolean;
  transactionId?: string;
}

// ── Params y resultado base para queries ───────────────────────────────
export interface QueryParams {
  /** Dirección EVM del proxy del stablecoin */
  contractAddress: string;
}

export interface QueryResult {
  success: boolean;
}

// ── Params específicos reutilizables ───────────────────────────────────

/** Operaciones que solo necesitan un amount (burn, rescue, rescueHBAR) */
export interface AmountParams extends CommandParams {
  amount: string;
}

/** Operaciones que necesitan un targetId (freeze, unfreeze, grantKyc, revokeKyc) */
export interface TargetParams extends CommandParams {
  targetId: string;
}

/** Operaciones que necesitan targetId + amount (cashIn, wipe, transfer parcial) */
export interface TargetAmountParams extends CommandParams {
  targetId: string;
  amount: string;
}

/** Operaciones de roles (grantRole, revokeRole) */
export interface RoleParams extends CommandParams {
  targetId: string;
  role: string;  // bytes32 del rol
}

/** Resultado con amount (burn, cashIn, wipe, etc.) */
export interface AmountResult extends TransactionResult {
  amount: string;
}

/** Resultado con targetId + amount */
export interface TargetAmountResult extends TransactionResult {
  targetId: string;
  amount: string;
}

// ── Params específicos de Hold ─────────────────────────────────────────

/** Operaciones que solo necesitan un holdId (releaseHold, reclaimHold) */
export interface HoldIdParams extends CommandParams {
  holdId: string;
}

/** Creación de hold (createHold) */
export interface CreateHoldParams extends CommandParams {
  holdId: string;
  recipient: string;
  notary: string;
  amount: string;
  expiration: string;
}

/** Ejecución de hold (executeHold) */
export interface ExecuteHoldParams extends CommandParams {
  holdId: string;
  amount: string;
}

// ── Params específicos de Transfer ─────────────────────────────────────

export interface TransferParams extends CommandParams {
  fromId: string;
  targetId: string;
  amount: string;
}

export interface TransferResult extends TransactionResult {
  fromId: string;
  targetId: string;
  amount: string;
}

// ── Params específicos de Reserve ──────────────────────────────────────

export interface ReserveAddressParams extends CommandParams {
  reserveAddress: string;
}

// ── Params y resultado de Create ───────────────────────────────────────

export interface CreateStableCoinParams extends CommandParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply?: string;
  maxSupply?: string;
  factoryAddress: string;
  resolverAddress: string;
  createReserve: boolean;
  reserveAddress?: string;
  reserveInitialAmount?: string;
}

export interface CreateStableCoinResult extends TransactionResult {
  proxyAddress: string;
  tokenId: string;
}

// ── Tipos de Hold para queries ─────────────────────────────────────────

export interface HoldData {
  holdId: string;
  recipient: string;
  notary: string;
  amount: string;
  expiration: string;
  releaseTime: string;
}

// ── Utilidad para bytes32 ──────────────────────────────────────────────

/** Asegura que un valor hex tiene exactamente 32 bytes (64 chars hex + 0x prefix) */
export function ensureBytes32(hex: string): Buffer {
  const clean = hex.replace('0x', '');
  if (clean.length > 64) {
    throw new Error('Bytes32 value exceeds 32 bytes');
  }
  const padded = clean.padStart(64, '0');
  return Buffer.from(padded, 'hex');
}
