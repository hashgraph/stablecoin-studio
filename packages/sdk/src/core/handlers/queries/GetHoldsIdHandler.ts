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
import { QueryParams, QueryResult } from '../types.js';

export interface GetHoldsIdParams extends QueryParams {
  targetId: string;
  start: number;
  end: number;
}

export interface GetHoldsIdResult extends QueryResult {
  holdIds: string[];
}

@Query('getHoldsId')
export class GetHoldsIdHandler extends BaseQueryHandler<GetHoldsIdParams, GetHoldsIdResult> {
  constructor() {
    super('getHoldsIdFor', ['function getHoldsIdFor(address account, uint256 start, uint256 end) view returns (uint256[])']);
  }

  protected mapParamsToArgs(params: GetHoldsIdParams): unknown[] {
    return [params.targetId, params.start, params.end];
  }

  protected createResult(data: unknown): GetHoldsIdResult {
    return {
      success: true,
      holdIds: Array.isArray(data) ? data.map(String) : [],
    };
  }
}
