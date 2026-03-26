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

export class ParseEVMReceiptStep implements ExecutionStep {
  readonly name = 'ParseEVMReceipt';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const receipt = await ctx.response.wait();
    const status = receipt?.status === 1 ? 'SUCCESS' : `FAILED(${receipt?.status})`;
    logger.step(`     status=${status} block=${receipt?.blockNumber} gas=${receipt?.gasUsed} logs=${receipt?.logs?.length ?? 0}`);
    return { ...ctx, receipt };
  }
}
