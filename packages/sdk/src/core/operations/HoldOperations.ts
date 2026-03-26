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

import { Operation } from '../decorator/OperationDecorator.js';
import { BaseContractOperation } from './BaseContractOperation.js';
import {
  CreateHoldParams,
  ExecuteHoldParams,
  HoldIdentifierParams,
  OperationResult,
  ReleaseHoldParams,
} from './types.js';
import {
  CREATE_HOLD_GAS,
  EXECUTE_HOLD_GAS,
  RELEASE_HOLD_GAS,
  RECLAIM_HOLD_GAS,
  EVM_ZERO_ADDRESS,
} from '../Constants.js';

// ── ABIs ─────────────────────────────────────────────────────────────────

const CREATE_HOLD_ABI = [
  'function createHold(tuple(int64 amount, uint256 expirationTimestamp, address escrow, address to, bytes data) _hold)',
];

const EXECUTE_HOLD_ABI = [
  'function executeHold(tuple(address tokenHolder, uint256 holdId) _holdIdentifier, address _to, int64 _amount)',
];

const RELEASE_HOLD_ABI = [
  'function releaseHold(tuple(address tokenHolder, uint256 holdId) _holdIdentifier, int64 _amount)',
];

const RECLAIM_HOLD_ABI = [
  'function reclaimHold(tuple(address tokenHolder, uint256 holdId) _holdIdentifier)',
];

// ── CreateHold ───────────────────────────────────────────────────────────

@Operation('createHold')
export class CreateHoldOperation extends BaseContractOperation<
  CreateHoldParams,
  OperationResult
> {
  constructor() {
    super('createHold', CREATE_HOLD_ABI, CREATE_HOLD_GAS);
  }

  protected mapParamsToArgs(params: CreateHoldParams): unknown[] {
    return [{
      amount: BigInt(params.amount),
      expirationTimestamp: BigInt(params.expirationTimestamp),
      escrow: params.escrowAddress,
      to: params.toAddress ?? EVM_ZERO_ADDRESS,
      data: '0x',
    }];
  }

  protected validateParams(params: CreateHoldParams): void {
    if (!params.contractAddress) throw new Error('contractAddress is required');
    if (!params.escrowAddress) throw new Error('escrowAddress is required');
    if (BigInt(params.amount) <= 0n) throw new Error('amount must be positive');
  }
}

// ── ExecuteHold ──────────────────────────────────────────────────────────

@Operation('executeHold')
export class ExecuteHoldOperation extends BaseContractOperation<
  ExecuteHoldParams,
  OperationResult
> {
  constructor() {
    super('executeHold', EXECUTE_HOLD_ABI, EXECUTE_HOLD_GAS);
  }

  protected mapParamsToArgs(params: ExecuteHoldParams): unknown[] {
    return [
      { tokenHolder: params.tokenHolder, holdId: BigInt(params.holdId) },
      params.toAddress ?? EVM_ZERO_ADDRESS,
      BigInt(params.amount),
    ];
  }

  protected validateParams(params: ExecuteHoldParams): void {
    if (!params.contractAddress) throw new Error('contractAddress is required');
    if (!params.tokenHolder) throw new Error('tokenHolder is required');
    if (BigInt(params.amount) <= 0n) throw new Error('amount must be positive');
  }
}

// ── ReleaseHold ──────────────────────────────────────────────────────────

@Operation('releaseHold')
export class ReleaseHoldOperation extends BaseContractOperation<
  ReleaseHoldParams,
  OperationResult
> {
  constructor() {
    super('releaseHold', RELEASE_HOLD_ABI, RELEASE_HOLD_GAS);
  }

  protected mapParamsToArgs(params: ReleaseHoldParams): unknown[] {
    return [
      { tokenHolder: params.tokenHolder, holdId: BigInt(params.holdId) },
      BigInt(params.amount),
    ];
  }

  protected validateParams(params: ReleaseHoldParams): void {
    if (!params.contractAddress) throw new Error('contractAddress is required');
    if (!params.tokenHolder) throw new Error('tokenHolder is required');
  }
}

// ── ReclaimHold ──────────────────────────────────────────────────────────

@Operation('reclaimHold')
export class ReclaimHoldOperation extends BaseContractOperation<
  HoldIdentifierParams,
  OperationResult
> {
  constructor() {
    super('reclaimHold', RECLAIM_HOLD_ABI, RECLAIM_HOLD_GAS);
  }

  protected mapParamsToArgs(params: HoldIdentifierParams): unknown[] {
    return [{
      tokenHolder: params.tokenHolder,
      holdId: BigInt(params.holdId),
    }];
  }

  protected validateParams(params: HoldIdentifierParams): void {
    if (!params.contractAddress) throw new Error('contractAddress is required');
    if (!params.tokenHolder) throw new Error('tokenHolder is required');
  }
}
