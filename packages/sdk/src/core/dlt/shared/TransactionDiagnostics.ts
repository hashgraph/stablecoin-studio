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

// ── Types ──────────────────────────────────────────────────────────────────

/** A single call within the call trace. */
export interface ContractCall {
  /** Address of the contract that initiated the call */
  from: string;
  /** Address of the called contract */
  to: string;
  /** Call type (CALL, DELEGATECALL, STATICCALL, CREATE, etc.) */
  callType: string;
  /** Input data (hex-encoded) */
  input: string;
  /** Output data (hex-encoded) */
  output?: string;
  /** Error message if the call failed */
  error?: string;
  /** Depth in the call stack */
  depth: number;
  /** Gas used */
  gasUsed?: number;
  /** Internal calls (sub-calls) */
  subcalls?: ContractCall[];
}

/**
 * Decoded revert error.
 * Example: { name: 'InsufficientBalance', args: { required: '1000', available: '500' } }
 */
export interface DecodedError {
  /** Error name (e.g., 'InsufficientBalance', 'Error(string)') */
  name: string;
  /** Decoded arguments */
  args: Record<string, unknown>;
  /** Hex selector of the error (first 4 bytes) */
  selector?: string;
}

/** A raw event log from the transaction. */
export interface RawLog {
  address: string;
  topics: string[];
  data: string;
}

/** Complete diagnostic result for a failed transaction. */
export interface DiagnosticReport {
  /** ID of the diagnosed transaction */
  transactionId: string;
  /** Main contract address */
  contractAddress: string;
  /** Raw revert reason (hex) */
  rawRevertReason?: string;
  /** Decoded revert reason as a readable string */
  revertMessage?: string;
  /** Decoded custom error (if using Solidity custom errors) */
  decodedError?: DecodedError;
  /** Full chain of calls between contracts */
  callTrace: ContractCall[];
  /** Raw event logs emitted during the transaction */
  logs?: RawLog[];
  /** Enriched call trace with resolved names and decoded selectors (opt-in via tracing config) */
  formattedCallTrace?: string;
  /** Total gas used */
  gasUsed?: number;
  /** Diagnostic timestamp */
  timestamp: Date;
}

// ── Interface ──────────────────────────────────────────────────────────────

/**
 * Interface abstracting the diagnosis of failed transactions
 * for different DLTs (Hedera mirror node, EVM provider).
 */
export interface TransactionDiagnostics {
  /**
   * Diagnoses a failed transaction: obtains the call trace,
   * decodes the revert reason, and produces a complete report.
   *
   * @param transactionId - Transaction ID (format depends on the DLT)
   * @param contractAddress - Main contract address
   * @param abis - Optional ABIs for decoding custom errors
   */
  diagnose(
    transactionId: string,
    contractAddress: string,
    abis?: string[],
  ): Promise<DiagnosticReport>;

  /**
   * Attempts to decode a raw revert reason.
   *
   * @param rawReason - Revert bytes (hex-encoded)
   * @param abis - ABIs for looking up custom errors
   */
  decodeRevertReason(
    rawReason: string,
    abis?: string[],
  ): DecodedError | string | undefined;
}
