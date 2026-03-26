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

import { AccountId, Client, ContractExecuteTransaction } from '@hiero-ledger/sdk';
import { ExecutionContext } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class SerializeHederaStep implements ExecutionStep {
  readonly name = 'SerializeHedera';

  constructor(
    private readonly client: Client,
    private readonly accountId?: string,
  ) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const tx = ctx.transaction as ContractExecuteTransaction;
    let frozen: ContractExecuteTransaction;
    if (this.client.operatorAccountId) {
      // Standard path: client has operator, freezeWith assigns payer + node IDs
      frozen = tx.freezeWith(this.client);
    } else if (this.accountId) {
      // External wallet path: set payer via _freezeWithAccountId, then
      // freezeWith to pick up the network's node account IDs.
      tx._freezeWithAccountId(AccountId.fromString(this.accountId));
      frozen = tx.freezeWith(this.client);
    } else {
      frozen = tx;
    }
    const transactionBytes: Uint8Array = frozen.toBytes();
    // Extract bodyBytes from the serialized transaction for external signing flows.
    // _signedTransactions is an internal API — wrap in try/catch for forward compat.
    let bodyBytes: Uint8Array | undefined;
    try {
      bodyBytes = (frozen as any)._signedTransactions?.get(0)?.bodyBytes ?? undefined;
    } catch {
      // Best-effort — not all SDK versions expose this internal structure
    }
    const signedTransaction = {
      kind: 'serialized' as const,
      transactionBytes,
      bodyBytes,
    };
    const hex = Buffer.from(transactionBytes).toString('hex');
    const preview = hex.length > 120 ? hex.slice(0, 120) + '...' : hex;
    logger.step(`     ${transactionBytes.length} bytes payer=${this.accountId ?? this.client.operatorAccountId ?? 'operator'} format=Hedera SDK`);
    logger.step(`     tx: 0x${preview}`);
    return { ...ctx, signedTransaction };
  }
}
