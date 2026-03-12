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

import { Command } from '../../decorators/Command.js';
import { BaseCommandHandler } from '../BaseCommandHandler.js';
import { TargetAmountParams, TargetAmountResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('cashIn')
export class CashInHandler extends BaseCommandHandler<TargetAmountParams, TargetAmountResult> {
  constructor() {
    super('mint', ['function mint(address account, uint256 amount)'], 120_000);
  }

  protected mapParamsToArgs(params: TargetAmountParams): unknown[] {
    return [params.targetId, BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: TargetAmountParams): ContractFunctionParameters {
    return new ContractFunctionParameters()
      .addAddress(params.targetId)
      .addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: TargetAmountParams): void {
    if (!params.targetId) throw new Error('Target account required');
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any, params: TargetAmountParams): TargetAmountResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      targetId: params.targetId,
      amount: params.amount,
    };
  }
}
