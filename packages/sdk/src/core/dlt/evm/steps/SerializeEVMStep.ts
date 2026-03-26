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

export class SerializeEVMStep implements ExecutionStep {
  readonly name = 'SerializeEVM';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const tx = ctx.transaction as ethers.ContractTransaction;
    const serialized = ethers.Transaction.from(tx).unsignedSerialized;
    const transactionBytes = ethers.getBytes(serialized);
    const hex = Buffer.from(transactionBytes).toString('hex');
    const preview = hex.length > 120 ? hex.slice(0, 120) + '...' : hex;
    logger.step(`     ${transactionBytes.length} bytes format=EVM/RLP`);
    logger.step(`     tx: 0x${preview}`);
    const signedTransaction = {
      kind: 'serialized' as const,
      transactionBytes,
    };
    return { ...ctx, signedTransaction };
  }
}
