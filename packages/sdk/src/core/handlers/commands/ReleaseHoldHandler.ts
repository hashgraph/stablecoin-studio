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
import { HoldIdParams, TransactionResult, ensureBytes32 } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('releaseHold')
export class ReleaseHoldHandler extends BaseCommandHandler<HoldIdParams, TransactionResult> {
  constructor() {
    super('releaseHold', ['function releaseHold(bytes32 holdId)'], 80_000);
  }

  protected mapParamsToArgs(params: HoldIdParams): unknown[] {
    return [params.holdId];
  }

  protected buildHederaFunctionParams(params: HoldIdParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addBytes32(ensureBytes32(params.holdId));
  }

  protected validateParams(params: HoldIdParams): void {
    if (!params.holdId) throw new Error('Hold ID required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
