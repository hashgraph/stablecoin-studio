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

import { ExecutionContext, SerializedTx } from '../../types/ExecutionContext.js';
import { ExecutionStep } from '../base/ExecutionStep.js';
import type { SignAndExecuteFunction } from '../../config/SigningConfig.js';
import LogService from '../../service/LogService.js';

const MIRROR_NODE_POLL_INTERVAL_MS = 2000;
const MIRROR_NODE_MAX_RETRIES = 15;

/**
 * Step for external wallets (WalletConnect/HashPack) that sign AND execute
 * in a single atomic operation. After execution, queries the mirror node
 * REST API to retrieve the transaction record (including contract logs)
 * so downstream steps (ExtractResultStep) can parse events like Deployed.
 */
export class SignAndExecuteExternalStep implements ExecutionStep {
  readonly name = 'SignAndExecuteExternal';

  constructor(
    private readonly signAndExecute: SignAndExecuteFunction,
    private readonly mirrorNodeBaseUrl: string,
  ) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const transactionIdStr = await this.signAndExecute(serialized.transactionBytes);

    // Query mirror node for the contract result (includes logs/events).
    // Mirror node may take a few seconds to index the transaction.
    const record = await this.fetchTransactionRecord(transactionIdStr);

    return { ...ctx, receipt: record };
  }

  private async fetchTransactionRecord(
    transactionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Convert Hedera transactionId format (0.0.X@seconds.nanos) to mirror node format (0.0.X-seconds-nanos)
    const mirrorTxId = transactionId
      .replace('@', '-')
      .replace(/\.([^.]*)$/, '-$1');

    const baseUrl = this.mirrorNodeBaseUrl.endsWith('/')
      ? this.mirrorNodeBaseUrl
      : this.mirrorNodeBaseUrl + '/';
    const url = `${baseUrl}contracts/results/${mirrorTxId}`;

    for (let attempt = 0; attempt < MIRROR_NODE_MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          const data = await response.json();
          if (data && data.logs) {
            LogService.logInfo(
              `[SignAndExecuteExternal] Got contract result from mirror node (${data.logs.length} logs)`,
            );
            // Return a receipt-like object compatible with ExtractResultStep / createResult:
            // - logs: array of { topics: string[], data: string } for EVM-style parsing
            // - transactionId: for reference
            return {
              transactionId,
              logs: data.logs.map((log: { topics: string[]; data: string }) => ({
                topics: log.topics,
                data: log.data,
              })),
            };
          }
        }
      } catch (err) {
        LogService.logTrace(
          `[SignAndExecuteExternal] Mirror node poll attempt ${attempt + 1} failed: ${err}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, MIRROR_NODE_POLL_INTERVAL_MS));
    }

    // If mirror node polling exhausted, return minimal result
    LogService.logInfo(
      '[SignAndExecuteExternal] WARNING: Could not fetch contract result from mirror node after retries, returning minimal result',
    );
    return { transactionId, logs: [] };
  }
}
