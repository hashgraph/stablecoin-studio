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

import { ExecutionContext } from '../../types/ExecutionContext.js';
import { ExecutionStep } from '../base/ExecutionStep.js';
import { logger } from '../../Logger.js';

export class ExtractResultStep implements ExecutionStep {
  readonly name = 'ExtractResult';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const result = ctx.builder.extractResult(ctx.receipt, ctx.params);
    if (result) {
      const details: string[] = [];
      if (result.transactionId) details.push(`txId=${result.transactionId}`);
      if ((result as any).tokenAddress) details.push(`token=${(result as any).tokenAddress}`);
      logger.step(`     ${details.length > 0 ? details.join(' ') : 'ok'}`);
    }
    return { ...ctx, result };
  }
}
