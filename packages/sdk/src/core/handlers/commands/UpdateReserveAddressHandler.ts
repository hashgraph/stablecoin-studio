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
import { ReserveAddressParams, TransactionResult } from '../types.js';
import { ContractFunctionParameters } from '@hiero-ledger/sdk';

@Command('updateReserveAddress')
export class UpdateReserveAddressHandler extends BaseCommandHandler<ReserveAddressParams, TransactionResult> {
  constructor() {
    super('updateReserveAddress', ['function updateReserveAddress(address newAddress)'], 80_000);
  }

  protected mapParamsToArgs(params: ReserveAddressParams): unknown[] {
    return [params.reserveAddress];
  }

  protected buildHederaFunctionParams(params: ReserveAddressParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addAddress(params.reserveAddress);
  }

  protected validateParams(params: ReserveAddressParams): void {
    if (!params.reserveAddress) throw new Error('Reserve address required');
  }

  protected createResult(receipt: any): TransactionResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
  }
}
