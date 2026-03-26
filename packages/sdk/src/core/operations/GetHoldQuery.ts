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

import { BaseContractQuery } from './BaseContractQuery.js';
import { QueryParams, QueryResult } from './types.js';

const GET_HOLD_ABI = [
  'function getHoldFor(tuple(address tokenHolder, uint256 holdId) _holdIdentifier) view returns (int64 amount_, uint256 expirationTimestamp_, address escrow_, address destination_, bytes data_, bytes operatorData_)',
];

interface GetHoldParams extends QueryParams {
  targetId: string;   // tokenHolder address
  holdId: string;     // hold ID (uint256)
}

interface GetHoldResult extends QueryResult {
  hold: {
    amount: string;
    expirationTimestamp: string;
    escrow: string;
    destination: string;
  };
}

export class GetHoldQuery extends BaseContractQuery<GetHoldParams, GetHoldResult> {
  constructor() {
    super('getHoldFor', GET_HOLD_ABI);
  }

  protected mapParamsToArgs(params: GetHoldParams): unknown[] {
    return [{
      tokenHolder: params.targetId,
      holdId: BigInt(params.holdId),
    }];
  }

  protected createResult(data: unknown): GetHoldResult {
    const result = data as any;
    return {
      success: true,
      hold: {
        amount: String(result.amount_),
        expirationTimestamp: String(result.expirationTimestamp_),
        escrow: String(result.escrow_),
        destination: String(result.destination_),
      },
    };
  }
}
