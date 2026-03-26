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
import { QueryConfig } from './config/configTypes.js';

/**
 * Generic query that reads its behavior entirely from a QueryConfig.
 *
 * Instead of creating one class per view method, define a config entry
 * in queries.ts and the registry will instantiate this class automatically.
 */
export class ConfigDrivenQuery extends BaseContractQuery<
  Record<string, unknown> & QueryParams,
  QueryResult
> {
  constructor(private readonly config: QueryConfig) {
    super(config.method, [config.abi]);
  }

  protected mapParamsToArgs(params: Record<string, unknown>): unknown[] {
    return (this.config.args ?? []).map((arg) => params[arg.param]);
  }

  protected createResult(data: unknown): QueryResult {
    const result: Record<string, unknown> = { success: true };
    const { field, transform } = this.config.result;
    switch (transform) {
      case 'string':
        result[field] = String(data);
        break;
      case 'boolean':
        result[field] = Boolean(data);
        break;
      case 'number':
        result[field] = Number(data);
        break;
      case 'strings':
        result[field] = Array.isArray(data) ? data.map(String) : [];
        break;
      case 'raw':
        result[field] = data;
        break;
    }
    return result as unknown as QueryResult;
  }
}
