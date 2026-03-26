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
import { UpdateTokenParams, OperationResult } from './types.js';
import { UPDATE_TOKEN_GAS } from '../Constants.js';

const UPDATE_TOKEN_ABI = [
  'function updateToken(tuple(string tokenName, string tokenSymbol, tuple(uint256 keyType, bytes publicKey, bool isEd25519)[] keys, int64 second, int64 autoRenewPeriod, string tokenMetadataURI) updatedToken)',
];

@Operation('updateToken')
export class UpdateTokenOperation extends BaseContractOperation<
  UpdateTokenParams,
  OperationResult
> {
  constructor() {
    super('updateToken', UPDATE_TOKEN_ABI, UPDATE_TOKEN_GAS);
  }

  protected mapParamsToArgs(params: UpdateTokenParams): unknown[] {
    return [{
      tokenName: params.tokenName ?? '',
      tokenSymbol: params.tokenSymbol ?? '',
      keys: params.keys ?? [],
      second: BigInt(params.second ?? -1),
      autoRenewPeriod: BigInt(params.autoRenewPeriod ?? -1),
      tokenMetadataURI: params.tokenMetadataURI ?? '',
    }];
  }

  protected validateParams(params: UpdateTokenParams): void {
    if (!params.contractAddress) {
      throw new Error('Contract address is required for updateToken');
    }
  }
}
