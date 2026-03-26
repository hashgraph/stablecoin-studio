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

import { ContractExecuteTransaction } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import type { ModeAware } from './ModeAware.js';

// ── Transaction types ───────────────────────────────────────────────────
export type HederaTransaction = ContractExecuteTransaction;
export type EVMTransaction = ethers.ContractTransaction;
export type AnyTransaction = HederaTransaction | EVMTransaction;

export type HederaSignedTx = {
  kind: 'hedera';
  transaction: ContractExecuteTransaction;
};
export type EVMSignedTx = {
  kind: 'evm';
  rawTransaction: string;
};
export type SerializedTx = {
  kind: 'serialized';
  transactionBytes: Uint8Array;
  bodyBytes?: Uint8Array;
};
export type AnySignedTransaction = HederaSignedTx | EVMSignedTx | SerializedTx;

/**
 * Hedera SDK and ethers return incompatible response/receipt types.
 * A generic union would thread complexity through the entire pipeline
 * for marginal benefit — `any` is the pragmatic choice here.
 */
export type AnyResponse = any;
/** @see AnyResponse — same rationale */
export type AnyReceipt = any;

// ── ExecutionContext ────────────────────────────────────────────────────
export interface ExecutionContext {
  readonly operationName: string;
  readonly params: Record<string, unknown>;
  readonly builder: TransactionBuilder;

  transaction?: AnyTransaction;
  signedTransaction?: AnySignedTransaction;
  response?: AnyResponse;
  receipt?: AnyReceipt;
  result?: OperationOutcome;
}

export interface TransactionBuilder extends ModeAware {
  buildHederaTransaction(params: Record<string, unknown>): HederaTransaction;
  buildEVMTransaction(params: Record<string, unknown>): Promise<EVMTransaction>;
  extractResult(receipt: AnyReceipt, params: Record<string, unknown>): OperationOutcome;
  validate(params: Record<string, unknown>): void;
}

export interface OperationOutcome {
  success: boolean;
  transactionId?: string;
  [key: string]: unknown;
}
