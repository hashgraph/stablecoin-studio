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
import { ExecutionContext, EVMSignedTx } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class SubmitToRPCStep implements ExecutionStep {
  readonly name = 'SubmitToRPC';

  constructor(private readonly provider: ethers.Provider) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    // Browser wallets (JsonRpcSigner) submit the tx directly via
    // eth_sendTransaction in SignWithSignerStep, so response is already set.
    if (ctx.response) {
      logger.step(`     txHash=${ctx.response.hash} via=eth_sendTransaction (already submitted)`);
      return ctx;
    }
    const signedTx = ctx.signedTransaction as EVMSignedTx;
    const response = await this.provider.broadcastTransaction(signedTx.rawTransaction);
    logger.step(`     txHash=${response.hash} via=JSON-RPC at ${new Date().toISOString()}`);
    return { ...ctx, response };
  }
}
