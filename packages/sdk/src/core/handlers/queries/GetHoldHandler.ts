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

import { Query } from '../../decorators/Query.js';
import { BaseQueryHandler } from '../BaseQueryHandler.js';
import { QueryParams, QueryResult, HoldData } from '../types.js';

export interface GetHoldParams extends QueryParams {
  targetId: string;
  holdId: number;
}

export interface GetHoldResult extends QueryResult {
  hold: HoldData;
}

@Query('getHold')
export class GetHoldHandler extends BaseQueryHandler<GetHoldParams, GetHoldResult> {
  constructor() {
    super('getHoldFor', ['function getHoldFor(address account, uint256 holdId) view returns (tuple(bytes32 holdId, address recipient, address notary, uint256 amount, uint256 expiration, uint256 releaseTime))']);
  }

  protected mapParamsToArgs(params: GetHoldParams): unknown[] {
    return [params.targetId, params.holdId];
  }

  protected createResult(data: unknown): GetHoldResult {
    return {
      success: true,
      hold: data as HoldData,
    };
  }
}
