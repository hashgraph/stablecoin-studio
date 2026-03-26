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
import { CreateHoldByControllerParams, OperationResult } from './types.js';
import { CONTROLLER_CREATE_HOLD_GAS } from '../Constants.js';

const HOLD_MANAGEMENT_ABI = [
  'function createHoldByController(address _sourceAddress, tuple(int64 amount, uint256 expirationTimestamp, address escrow, address to, bytes data) _hold, bytes _operatorData) returns (bool)',
];

@Operation('createHoldByController')
export class CreateHoldByControllerOperation extends BaseContractOperation<
  CreateHoldByControllerParams,
  OperationResult
> {
  constructor() {
    super('createHoldByController', HOLD_MANAGEMENT_ABI, CONTROLLER_CREATE_HOLD_GAS);
  }

  protected mapParamsToArgs(params: CreateHoldByControllerParams): unknown[] {
    const hold = {
      amount: BigInt(params.amount),
      expirationTimestamp: BigInt(params.expirationTimestamp),
      escrow: params.escrowAddress,
      to: params.toAddress,
      data: '0x',
    };
    return [params.sourceAddress, hold, '0x'];
  }

  protected validateParams(params: CreateHoldByControllerParams): void {
    if (!params.contractAddress) {
      throw new Error('Contract address is required for createHoldByController');
    }
    if (!params.sourceAddress) {
      throw new Error('Source address is required');
    }
  }
}
