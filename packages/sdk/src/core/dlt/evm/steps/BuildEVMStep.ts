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

import { ExecutionContext } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class BuildEVMStep implements ExecutionStep {
  readonly name = 'BuildEVM';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const transaction = await ctx.builder.buildEVMTransaction(ctx.params);
    const to = (transaction as any).to ?? (ctx.params.contractAddress as string) ?? '';
    const dataLen = (transaction as any).data?.length ?? 0;
    const paramEntries = Object.entries(ctx.params)
      .filter(([k]) => k !== 'contractAddress' && k !== 'abi')
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    logger.step(`     to=${to} data=${dataLen} bytes`);
    if (paramEntries) logger.step(`     params: ${paramEntries}`);
    return { ...ctx, transaction };
  }
}
