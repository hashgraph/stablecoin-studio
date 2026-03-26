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

import { ethers } from 'ethers';
import { QueryParams, QueryResult } from './types.js';

/**
 * Abstract base class for all query handlers.
 *
 * Queries are view/pure calls to the contract — they do not produce transactions,
 * are not signed, and do not go through the pipeline. They call the RPC node directly.
 *
 * Each concrete handler extends this class and only implements:
 * - mapParamsToArgs(): how to convert params to contract arguments
 * - createResult(): how to interpret the contract response
 */
export abstract class BaseContractQuery<
  TParams extends QueryParams = QueryParams,
  TResult extends QueryResult = QueryResult,
> {

  constructor(
    /** Contract view method name (e.g. 'balanceOf') */
    protected readonly methodName: string,
    /** ABI fragments for ethers.Interface (e.g. ['function balanceOf(address) view returns (uint256)']) */
    protected readonly abi: string[],
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // ABSTRACT METHODS
  // ══════════════════════════════════════════════════════════════════════

  /** Converts typed params to arguments for the contract view function */
  protected abstract mapParamsToArgs(params: TParams): unknown[];

  /** Interprets the contract response and builds the typed result */
  protected abstract createResult(data: unknown, params: TParams): TResult | Promise<TResult>;

  // ══════════════════════════════════════════════════════════════════════
  // MAIN METHOD
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Executes the query against the contract.
   *
   * @param provider - ethers Provider (connected to the RPC node)
   * @param params - Query parameters
   * @returns Typed result
   */
  async execute(provider: ethers.Provider, params: TParams): Promise<TResult> {
    const contract = new ethers.Contract(params.contractAddress, this.abi, provider);
    const args = this.mapParamsToArgs(params);
    const data = await contract[this.methodName](...args);
    return this.createResult(data, params);
  }

  /** Method name (useful for debugging/logging) */
  getMethodName(): string {
    return this.methodName;
  }
}
