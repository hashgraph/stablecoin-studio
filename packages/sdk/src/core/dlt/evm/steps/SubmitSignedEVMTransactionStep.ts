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
import { ExecutionContext, SerializedTx } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class SubmitSignedEVMTransactionStep implements ExecutionStep {
  readonly name = 'SubmitSignedEVMTransaction';

  constructor(private readonly provider: ethers.Provider) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const rawTransaction = ethers.hexlify(serialized.transactionBytes);
    const response = await this.provider.broadcastTransaction(rawTransaction);
    logger.step(`     txHash=${response.hash} via=JSON-RPC at ${new Date().toISOString()}`);
    return { ...ctx, response };
  }
}
