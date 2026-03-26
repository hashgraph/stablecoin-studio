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
import { UpdateCustomFeesParams, OperationResult } from './types.js';
import { UPDATE_CUSTOM_FEES_GAS } from '../Constants.js';

const CUSTOM_FEES_ABI = [
  'function updateTokenCustomFees(tuple(int64 amount, address tokenId, bool useHbarsForPayment, bool useCurrentTokenForPayment, address feeCollector)[] fixedFees, tuple(int64 numerator, int64 denominator, int64 minimumAmount, int64 maximumAmount, bool netOfTransfers, address feeCollector)[] fractionalFees) returns (bool)',
];

@Operation('updateCustomFees')
export class UpdateCustomFeesOperation extends BaseContractOperation<
  UpdateCustomFeesParams,
  OperationResult
> {
  constructor() {
    super('updateTokenCustomFees', CUSTOM_FEES_ABI, UPDATE_CUSTOM_FEES_GAS);
  }

  protected mapParamsToArgs(params: UpdateCustomFeesParams): unknown[] {
    return [params.fixedFees, params.fractionalFees];
  }

  protected validateParams(params: UpdateCustomFeesParams): void {
    if (!params.contractAddress) {
      throw new Error('Contract address is required for updateCustomFees');
    }
  }
}
