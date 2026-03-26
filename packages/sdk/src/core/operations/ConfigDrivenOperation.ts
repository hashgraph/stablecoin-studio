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

import { BaseContractOperation } from './BaseContractOperation.js';
import { OperationParams, OperationResult } from './types.js';
import { AnyReceipt } from '../types/ExecutionContext.js';
import { OperationConfig } from './config/configTypes.js';

/**
 * Generic operation that reads its behavior entirely from an OperationConfig.
 *
 * Instead of creating one class per contract method, define a config entry
 * in operations.ts and the registry will instantiate this class automatically.
 */
export class ConfigDrivenOperation extends BaseContractOperation<
  Record<string, unknown> & OperationParams,
  OperationResult
> {
  constructor(private readonly config: OperationConfig) {
    super(config.method, [config.abi], config.gas);
  }

  protected mapParamsToArgs(params: Record<string, unknown>): unknown[] {
    return (this.config.args ?? []).map((arg) => {
      const value = params[arg.param];
      if (arg.type === 'uint256' || arg.type === 'int256' || arg.type === 'int64') return BigInt(value as string);
      return value;
    });
  }

  protected validateParams(params: Record<string, unknown>): void {
    for (const arg of this.config.args ?? []) {
      const value = params[arg.param];
      switch (arg.type) {
        case 'uint256':
        case 'int256':
        case 'int64': {
          const n = BigInt(value as string);
          if (arg.allowZero ? n < 0n : n <= 0n) {
            throw new Error('Amount must be positive');
          }
          break;
        }
        case 'address':
        case 'bytes32':
          if (!value) {
            throw new Error(`${arg.param} is required`);
          }
          break;
      }
    }
  }

  protected createResult(
    receipt: AnyReceipt,
    params: Record<string, unknown>,
  ): OperationResult {
    const result: Record<string, unknown> = {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    };
    for (const field of this.config.resultFields ?? []) {
      result[field] = params[field];
    }
    if (this.config.staticResult) {
      Object.assign(result, this.config.staticResult);
    }
    return result as OperationResult;
  }
}
