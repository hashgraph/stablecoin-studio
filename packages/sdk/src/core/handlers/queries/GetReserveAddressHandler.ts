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

export interface GetReserveAddressResult extends QueryResult {
  reserveAddress: string;
}

@Query('getReserveAddress')
export class GetReserveAddressHandler extends BaseQueryHandler<QueryParams, GetReserveAddressResult> {
  constructor() {
    super('getReserveAddress', ['function getReserveAddress() view returns (address)']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected createResult(data: unknown): GetReserveAddressResult {
    return {
      success: true,
      reserveAddress: String(data),
    };
  }
}
