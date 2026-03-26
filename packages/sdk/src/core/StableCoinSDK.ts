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
  TransactionOrchestrator,
  OrchestratorConfig,
} from './orchestration/TransactionOrchestrator.js';
import { fromEnvironment } from './config/fromEnvironment.js';
import type { OperationOutcome } from './types/ExecutionContext.js';
import type {
  OperationParams,
  AmountParams,
  TargetParams,
  TargetAmountParams,
  RoleParams,
  CreateHoldParams,
  HoldIdentifierParams,
  ExecuteHoldParams,
  ReleaseHoldParams,
  ReclaimHoldParams,
  TransferParams,
  ReserveAddressParams,
  CreateStableCoinParams,
  CreateStableCoinResult,
  UpdateTokenParams,
  UpdateCustomFeesParams,
  OperationResult,
  QueryParams,
  QueryResult,
} from './operations/types.js';

// ── StableCoinSDK — INTERNAL test utility ──────────────────────────────────────
//
// NOT part of the public API. Use StableCoin (port/in/StableCoin.ts) instead.
//
// This class provides direct access to the TransactionOrchestrator without
// pre-flight validations. It exists only for integration tests that need to
// exercise the core pipeline in isolation.
//
// Production consumers must use the validated entry point:
//   import StableCoin from '@hashgraph/stablecoin-npm-sdk';
//   await StableCoin.cashIn({ tokenId, targetId, amount });
//
export class StableCoinSDK {
  private readonly orchestrator: TransactionOrchestrator;

  constructor(config: OrchestratorConfig) {
    this.orchestrator = new TransactionOrchestrator(config);
  }

  /** Auto-configure from environment variables (.env). */
  static fromEnvironment(
    env?: Record<string, string | undefined>,
  ): StableCoinSDK {
    return new StableCoinSDK(fromEnvironment(env));
  }

  // ── Create ──────────────────────────────────────────────────────────────

  async create(params: CreateStableCoinParams): Promise<CreateStableCoinResult> {
    return this.orchestrator.execute('create', params as any) as Promise<CreateStableCoinResult>;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  async pause(params: OperationParams): Promise<OperationResult> {
    return this.exec('pause', params);
  }

  async unpause(params: OperationParams): Promise<OperationResult> {
    return this.exec('unpause', params);
  }

  async delete(params: OperationParams): Promise<OperationResult> {
    return this.exec('delete', params);
  }

  // ── Token management ──────────────────────────────────────────────────

  async updateToken(params: UpdateTokenParams): Promise<OperationResult> {
    return this.exec('updateToken', params);
  }

  async updateCustomFees(params: UpdateCustomFeesParams): Promise<OperationResult> {
    return this.exec('updateCustomFees', params);
  }

  // ── Supply ──────────────────────────────────────────────────────────────

  async cashIn(params: TargetAmountParams): Promise<OperationResult> {
    return this.exec('cashIn', params);
  }

  async burn(params: AmountParams): Promise<OperationResult> {
    return this.exec('burn', params);
  }

  async wipe(params: TargetAmountParams): Promise<OperationResult> {
    return this.exec('wipe', params);
  }

  // ── Transfer ────────────────────────────────────────────────────────────

  async transfer(params: TransferParams): Promise<OperationResult> {
    return this.exec('transfer', params);
  }

  // ── Rescue ──────────────────────────────────────────────────────────────

  async rescue(params: AmountParams): Promise<OperationResult> {
    return this.exec('rescue', params);
  }

  async rescueHBAR(params: AmountParams): Promise<OperationResult> {
    return this.exec('rescueHBAR', params);
  }

  // ── Compliance ──────────────────────────────────────────────────────────

  async freeze(params: TargetParams): Promise<OperationResult> {
    return this.exec('freeze', params);
  }

  async unfreeze(params: TargetParams): Promise<OperationResult> {
    return this.exec('unfreeze', params);
  }

  async grantKyc(params: TargetParams): Promise<OperationResult> {
    return this.exec('grantKyc', params);
  }

  async revokeKyc(params: TargetParams): Promise<OperationResult> {
    return this.exec('revokeKyc', params);
  }

  // ── Roles ───────────────────────────────────────────────────────────────

  async grantRole(params: RoleParams): Promise<OperationResult> {
    return this.exec('grantRole', params);
  }

  async revokeRole(params: RoleParams): Promise<OperationResult> {
    return this.exec('revokeRole', params);
  }

  async grantMultiRoles(params: Record<string, unknown>): Promise<OperationResult> {
    return this.exec('grantMultiRoles', params);
  }

  async revokeMultiRoles(params: Record<string, unknown>): Promise<OperationResult> {
    return this.exec('revokeMultiRoles', params);
  }

  async grantSupplierRole(params: TargetAmountParams): Promise<OperationResult> {
    return this.exec('grantSupplierRole', params);
  }

  async revokeSupplierRole(params: TargetParams): Promise<OperationResult> {
    return this.exec('revokeSupplierRole', params);
  }

  async grantUnlimitedSupplierRole(params: TargetParams): Promise<OperationResult> {
    return this.exec('grantUnlimitedSupplierRole', params);
  }

  // ── Allowance ───────────────────────────────────────────────────────────

  async increaseAllowance(params: TargetAmountParams): Promise<OperationResult> {
    return this.exec('increaseAllowance', params);
  }

  async decreaseAllowance(params: TargetAmountParams): Promise<OperationResult> {
    return this.exec('decreaseAllowance', params);
  }

  async resetAllowance(params: TargetParams): Promise<OperationResult> {
    return this.exec('resetAllowance', params);
  }

  // ── Holds ───────────────────────────────────────────────────────────────

  async createHold(params: CreateHoldParams): Promise<OperationResult> {
    return this.exec('createHold', params);
  }

  async executeHold(params: ExecuteHoldParams): Promise<OperationResult> {
    return this.exec('executeHold', params);
  }

  async releaseHold(params: ReleaseHoldParams): Promise<OperationResult> {
    return this.exec('releaseHold', params);
  }

  async reclaimHold(params: ReclaimHoldParams): Promise<OperationResult> {
    return this.exec('reclaimHold', params);
  }

  // ── Reserve ─────────────────────────────────────────────────────────────

  async updateReserveAddress(params: ReserveAddressParams): Promise<OperationResult> {
    return this.exec('updateReserveAddress', params);
  }

  async updateReserveAmount(params: AmountParams): Promise<OperationResult> {
    return this.exec('updateReserveAmount', params);
  }

  // ── Queries (view/pure — no transaction) ────────────────────────────────

  async getBalance(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('getBalance', params);
  }

  async getBurnableAmount(params: QueryParams): Promise<QueryResult> {
    return this.query('getBurnableAmount', params);
  }

  async getReserveAddress(params: QueryParams): Promise<QueryResult> {
    return this.query('getReserveAddress', params);
  }

  async getReserveAmount(params: QueryParams): Promise<QueryResult> {
    return this.query('getReserveAmount', params);
  }

  async hasRole(params: { contractAddress: string; role: string; targetId: string }): Promise<QueryResult> {
    return this.query('hasRole', params);
  }

  async getRoles(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('getRoles', params);
  }

  async getAccountsWithRole(params: { contractAddress: string; role: string }): Promise<QueryResult> {
    return this.query('getAccountsWithRoles', params);
  }

  async getAllowance(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('getAllowance', params);
  }

  async isUnlimited(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('isUnlimited', params);
  }

  async getHeldAmount(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('getHeldAmount', params);
  }

  async getHoldCount(params: { contractAddress: string; targetId: string }): Promise<QueryResult> {
    return this.query('getHoldCount', params);
  }

  async getHold(params: { contractAddress: string; targetId: string; holdId: string }): Promise<QueryResult> {
    return this.query('getHold', params);
  }

  async getHoldsId(params: { contractAddress: string; targetId: string; start: string; end: string }): Promise<QueryResult> {
    return this.query('getHoldsId', params);
  }

  // ── Generic / advanced ─────────────────────────────────────────────────

  /** Execute any registered operation by name (escape hatch). */
  async execute(
    operationName: string,
    params: Record<string, unknown>,
  ): Promise<OperationOutcome> {
    return this.orchestrator.execute(operationName, params);
  }

  /** Execute any registered query by name (escape hatch). */
  async executeQuery(
    queryName: string,
    params: Record<string, unknown>,
  ): Promise<QueryResult> {
    return this.orchestrator.executeQuery(queryName, params);
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private async exec(name: string, params: object): Promise<OperationResult> {
    return this.orchestrator.execute(name, params as Record<string, unknown>) as Promise<OperationResult>;
  }

  private async query(name: string, params: object): Promise<QueryResult> {
    return this.orchestrator.executeQuery(name, params as Record<string, unknown>);
  }
}
