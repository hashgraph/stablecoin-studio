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
import { AmountParams, AmountResult } from '../types.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';

@Command('burn')
export class BurnHandler extends BaseCommandHandler<AmountParams, AmountResult> {
  constructor() {
    super('burn', ['function burn(uint256 amount)'], 100_000);
  }

  protected mapParamsToArgs(params: AmountParams): unknown[] {
    return [BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: AmountParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addUint256(Long.fromString(params.amount));
  }

  protected validateParams(params: AmountParams): void {
    if (BigInt(params.amount) <= 0n) throw new Error('Amount must be positive');
  }

  protected createResult(receipt: any, params: AmountParams): AmountResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
      amount: params.amount,
    };
  }
}
