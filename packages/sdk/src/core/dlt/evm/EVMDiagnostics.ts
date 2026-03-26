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
import {
  TransactionDiagnostics,
  DiagnosticReport,
  ContractCall,
  DecodedError,
} from '../shared/TransactionDiagnostics.js';
import { decodeRevertReason, formatRevertMessage } from '../shared/decodeRevertReason.js';

/**
 * Diagnostics implementation for EVM via JSON-RPC provider.
 *
 * Uses the provider to:
 * - Replay the failed transaction with eth_call to capture the revert reason
 * - Retrieve the receipt with logs
 * - Optionally use debug_traceTransaction for the call trace
 * - Decode custom errors (including HTS precompile) using the provided ABIs
 */
export class EVMDiagnostics implements TransactionDiagnostics {
  constructor(
    private readonly provider: ethers.Provider,
  ) {}

  async diagnose(
    transactionId: string,
    contractAddress: string,
    abis?: string[],
  ): Promise<DiagnosticReport> {
    // Fetch receipt and original transaction in parallel
    const [receipt, tx, traceResult] = await Promise.all([
      this.provider.getTransactionReceipt(transactionId),
      this.provider.getTransaction(transactionId),
      this.tryDebugTrace(transactionId),
    ]);

    let rawRevertReason: string | undefined;

    // If we have the original transaction, replay with eth_call to get revert reason
    if (tx) {
      rawRevertReason = await this.simulateForRevert(tx);
    }

    const decoded = rawRevertReason
      ? this.decodeRevertReason(rawRevertReason, abis)
      : undefined;

    return {
      transactionId,
      contractAddress,
      rawRevertReason,
      revertMessage: formatRevertMessage(decoded) ?? rawRevertReason,
      decodedError: typeof decoded === 'object' ? decoded : undefined,
      callTrace: traceResult,
      gasUsed: receipt?.gasUsed ? Number(receipt.gasUsed) : undefined,
      timestamp: new Date(),
    };
  }

  decodeRevertReason(
    rawReason: string,
    abis?: string[],
  ): DecodedError | string | undefined {
    return decodeRevertReason(rawReason, abis);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  /** Replays the transaction with eth_call to capture the revert reason. */
  private async simulateForRevert(
    tx: ethers.TransactionResponse,
  ): Promise<string | undefined> {
    try {
      await this.provider.call({
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value,
        blockTag: tx.blockNumber ? tx.blockNumber - 1 : undefined,
      });
      // If it doesn't revert, there's no revert reason
      return undefined;
    } catch (error: unknown) {
      // ethers v6 throws an error with `data` containing the revert reason
      if (error && typeof error === 'object' && 'data' in error) {
        return (error as { data: string }).data;
      }
      if (error instanceof Error && error.message) {
        // Try to extract hex from the message
        const match = error.message.match(/0x[0-9a-fA-F]+/);
        if (match) return match[0];
      }
      return undefined;
    }
  }

  /**
   * Attempts to get the debug trace (debug_traceTransaction).
   * Not all nodes support this method — fails silently.
   */
  private async tryDebugTrace(transactionId: string): Promise<ContractCall[]> {
    try {
      const jsonRpcProvider = this.provider as ethers.JsonRpcProvider;
      if (!jsonRpcProvider.send) return [];

      const trace = await jsonRpcProvider.send('debug_traceTransaction', [
        transactionId,
        { tracer: 'callTracer' },
      ]);

      return this.parseCallTracerResult(trace);
    } catch {
      // Most public nodes don't support debug_traceTransaction
      return [];
    }
  }

  /** Parses the Geth callTracer result into a flat list of ContractCalls. */
  private parseCallTracerResult(trace: any, depth = 0): ContractCall[] {
    if (!trace) return [];

    const call: ContractCall = {
      from: trace.from ?? '',
      to: trace.to ?? '',
      callType: trace.type ?? 'CALL',
      input: trace.input ?? '',
      output: trace.output,
      error: trace.error,
      depth,
      gasUsed: trace.gasUsed ? parseInt(trace.gasUsed, 16) : undefined,
    };

    const result: ContractCall[] = [call];

    if (trace.calls && Array.isArray(trace.calls)) {
      for (const subcall of trace.calls) {
        result.push(...this.parseCallTracerResult(subcall, depth + 1));
      }
    }

    return result;
  }
}
