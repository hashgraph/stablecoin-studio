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

import {
  TransactionBuilder,
  HederaTransaction,
  EVMTransaction,
  AnyReceipt,
  OperationOutcome,
} from '../types/ExecutionContext.js';
import { ExecutionMode } from '../types/ExecutionMode.js';
import { OperationParams, OperationResult } from './types.js';
import { ContractExecuteTransaction, ContractId } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';

/**
 * Abstract base class for all smart contract operations.
 *
 * Each concrete operation extends this class and implements:
 * - mapParamsToArgs(): convert params to contract function arguments
 * - (optional) createResult(): interpret the receipt (default returns { success, transactionId })
 * - (optional) validateParams(): business validations
 *
 * Both Hedera and EVM paths use ethers ABI encoding via mapParamsToArgs().
 * This means structs, tuples, and arrays work on both paths without
 * needing per-operation overrides.
 *
 * Implements TransactionBuilder so the execution chain can use it directly.
 */
export abstract class BaseContractOperation<
  TParams extends OperationParams = OperationParams,
  TResult extends OperationResult = OperationResult,
> implements TransactionBuilder {

  constructor(
    protected readonly methodName: string,
    protected readonly abi: string[],
    protected readonly defaultGas: number,
    protected readonly modes: ExecutionMode[] = ['hedera', 'evm'],
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // ABSTRACT — each concrete operation implements this
  // ══════════════════════════════════════════════════════════════════════

  protected abstract mapParamsToArgs(params: TParams): unknown[];

  // ══════════════════════════════════════════════════════════════════════
  // OPTIONAL — override only when needed
  // ══════════════════════════════════════════════════════════════════════

  protected createResult(receipt: AnyReceipt, _params: TParams): TResult {
    return {
      success: true,
      transactionId: receipt?.transactionId?.toString() ?? '',
    } as TResult;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected validateParams(_params: TParams): void {}

  protected getGas(_params: TParams): number {
    return this.defaultGas;
  }

  // ══════════════════════════════════════════════════════════════════════
  // TransactionBuilder implementation
  // Both paths use ethers encoding via mapParamsToArgs().
  // Override buildHederaTransaction only for special cases (payable, etc.).
  // ══════════════════════════════════════════════════════════════════════

  buildHederaTransaction(rawParams: Record<string, unknown>): HederaTransaction {
    const params = rawParams as unknown as TParams;
    this.validateParams(params);
    const args = this.mapParamsToArgs(params);
    const iface = new ethers.Interface(this.abi);
    const calldata = ethers.getBytes(
      iface.encodeFunctionData(this.methodName, args),
    );
    const tx = new ContractExecuteTransaction()
      .setGas(this.getGas(params))
      .setFunctionParameters(calldata);
    if (params.contractAddress) {
      tx.setContractId(ContractId.fromSolidityAddress(params.contractAddress));
    }
    return tx;
  }

  async buildEVMTransaction(rawParams: Record<string, unknown>): Promise<EVMTransaction> {
    const params = rawParams as unknown as TParams;
    this.validateParams(params);
    const args = this.mapParamsToArgs(params);
    const iface = new ethers.Interface(this.abi);
    const data = iface.encodeFunctionData(this.methodName, args);
    return {
      to: params.contractAddress,
      data,
      gasLimit: this.getGas(params),
    } as unknown as EVMTransaction;
  }

  extractResult(receipt: AnyReceipt, rawParams: Record<string, unknown>): OperationOutcome {
    const params = rawParams as unknown as TParams;
    return this.createResult(receipt, params);
  }

  supportsMode(mode: ExecutionMode): boolean {
    return this.modes.includes(mode);
  }

  getSupportedModes(): ExecutionMode[] {
    return [...this.modes];
  }

  validate(rawParams: Record<string, unknown>): void {
    this.validateParams(rawParams as unknown as TParams);
  }

  getMethodName(): string {
    return this.methodName;
  }
}
