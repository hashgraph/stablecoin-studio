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
  TransactionDiagnostics,
  DiagnosticReport,
  ContractCall,
  DecodedError,
  RawLog,
} from '../shared/TransactionDiagnostics.js';
import { decodeRevertReason, formatRevertMessage } from '../shared/decodeRevertReason.js';

/** Mirror node response for /api/v1/contracts/results/{transactionId} */
interface MirrorNodeContractResult {
  result: string;
  error_message?: string;
  call_result?: string;
  from: string;
  to: string;
  function_parameters?: string;
  gas_used?: number;
  timestamp?: string;
  logs?: { address: string; topics: string[]; data: string }[];
}

/** Mirror node response for /api/v1/contracts/results/{transactionId}/actions */
interface MirrorNodeAction {
  caller: string;
  recipient: string;
  call_type: string;
  input: string;
  result_data: string;
  result_data_type: string;
  gas_used: number;
  call_depth: number;
}

/**
 * Diagnostics implementation for Hedera via the mirror node REST API.
 *
 * Queries the mirror node to obtain:
 * - Contract execution result (revert reason)
 * - Actions (full call trace)
 * - Decodes custom errors (including HTS precompile) using the provided ABIs
 */
export class MirrorNodeDiagnostics implements TransactionDiagnostics {
  constructor(
    private readonly mirrorNodeUrl: string,
    private readonly fetchFn: typeof fetch = globalThis.fetch,
  ) {}

  async diagnose(
    transactionId: string,
    contractAddress: string,
    abis?: string[],
  ): Promise<DiagnosticReport> {
    // Normalize transactionId for mirror node URL
    // Hedera format: "0.0.1234@1234567890.000" -> "0.0.1234-1234567890-000"
    const normalizedId = this.normalizeTransactionId(transactionId);

    // Parallel queries: result + actions
    const [contractResult, actions] = await Promise.all([
      this.fetchContractResult(normalizedId),
      this.fetchActions(normalizedId),
    ]);

    const rawRevertReason = contractResult?.error_message;
    const decoded = rawRevertReason
      ? this.decodeRevertReason(rawRevertReason, abis)
      : undefined;

    // Extract logs from contract result
    const logs: RawLog[] = (contractResult?.logs ?? []).map((l) => ({
      address: l.address,
      topics: l.topics,
      data: l.data,
    }));

    return {
      transactionId,
      contractAddress,
      rawRevertReason,
      revertMessage: formatRevertMessage(decoded) ?? rawRevertReason,
      decodedError: typeof decoded === 'object' ? decoded : undefined,
      callTrace: this.buildCallTrace(actions),
      logs: logs.length > 0 ? logs : undefined,
      gasUsed: contractResult?.gas_used,
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

  private normalizeTransactionId(txId: string): string {
    // "0.0.1234@1234567890.000" -> "0.0.1234-1234567890-000"
    // Must preserve account dots (0.0.) while replacing @ and timestamp dot.
    const atIdx = txId.indexOf('@');
    if (atIdx === -1) return txId;
    const account = txId.slice(0, atIdx);
    const timestamp = txId.slice(atIdx + 1).replace('.', '-');
    return `${account}-${timestamp}`;
  }

  /**
   * Fetch with retry — the mirror node indexes transactions with a few seconds
   * of lag after consensus. Retries up to 3 times with 2s delay on 404.
   */
  private async fetchWithRetry<T>(
    url: string,
    parse: (res: Response) => Promise<T>,
    fallback: T,
  ): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await this.fetchFn(url);
        if (response.ok) return parse(response);
        if (response.status === 404 && attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return fallback;
      } catch {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        return fallback;
      }
    }
    return fallback;
  }

  private async fetchContractResult(
    normalizedTxId: string,
  ): Promise<MirrorNodeContractResult | null> {
    const url = `${this.mirrorNodeUrl}/api/v1/contracts/results/${normalizedTxId}`;
    return this.fetchWithRetry(
      url,
      (res) => res.json() as Promise<MirrorNodeContractResult>,
      null,
    );
  }

  private async fetchActions(
    normalizedTxId: string,
  ): Promise<MirrorNodeAction[]> {
    const url = `${this.mirrorNodeUrl}/api/v1/contracts/results/${normalizedTxId}/actions`;
    return this.fetchWithRetry(
      url,
      async (res) => {
        const data = await res.json() as { actions?: MirrorNodeAction[] };
        return data.actions ?? [];
      },
      [],
    );
  }

  private buildCallTrace(actions: MirrorNodeAction[]): ContractCall[] {
    return actions.map((action) => ({
      from: action.caller,
      to: action.recipient,
      callType: action.call_type,
      input: action.input,
      output: action.result_data_type === 'OUTPUT' ? action.result_data : undefined,
      error: (action.result_data_type === 'ERROR' || action.result_data_type === 'REVERT_REASON')
        ? action.result_data : undefined,
      depth: action.call_depth,
      gasUsed: action.gas_used,
    }));
  }
}
