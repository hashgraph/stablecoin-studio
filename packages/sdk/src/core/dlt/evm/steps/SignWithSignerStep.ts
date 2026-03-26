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
import { ExecutionContext } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class SignWithSignerStep implements ExecutionStep {
  readonly name = 'SignWithSigner';

  constructor(private readonly signer: ethers.Signer) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const tx = ctx.transaction as ethers.ContractTransaction;
    // populateTransaction fills in nonce, chainId, gasPrice/maxFeePerGas
    // which signTransaction does NOT do automatically.
    const populated = await this.signer.populateTransaction(tx);
    let signerAddr = 'unknown';
    try { signerAddr = await this.signer.getAddress(); } catch { /* mock-safe */ }

    // Browser wallets (e.g. MetaMask's JsonRpcSigner) do not support
    // eth_signTransaction (returns -32004 "Method not supported").
    // Use sendTransaction instead, which calls eth_sendTransaction and
    // returns a TransactionResponse directly — SubmitToRPCStep detects
    // this and skips the redundant broadcastTransaction call.
    if (this.signer instanceof ethers.JsonRpcSigner) {
      logger.step(`     signer=${signerAddr} nonce=${populated.nonce} chainId=${populated.chainId} via=eth_sendTransaction`);
      const response = await this.signer.sendTransaction(populated);
      return { ...ctx, response };
    }

    const rawTransaction = await this.signer.signTransaction(populated);
    logger.step(`     signer=${signerAddr} nonce=${populated.nonce} chainId=${populated.chainId} via=JSON-RPC`);
    const signedTransaction = { kind: 'evm' as const, rawTransaction };
    return { ...ctx, signedTransaction };
  }
}
