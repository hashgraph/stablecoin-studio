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

export interface GetHoldCountParams extends QueryParams {
  targetId: string;
}

export interface GetHoldCountResult extends QueryResult {
  count: number;
}

@Query('getHoldCount')
export class GetHoldCountHandler extends BaseQueryHandler<GetHoldCountParams, GetHoldCountResult> {
  constructor() {
    super('getHoldCountFor', ['function getHoldCountFor(address account) view returns (uint256)']);
  }

  protected mapParamsToArgs(params: GetHoldCountParams): unknown[] {
    return [params.targetId];
  }

  protected createResult(data: unknown): GetHoldCountResult {
    return {
      success: true,
      count: Number(data),
    };
  }
}
