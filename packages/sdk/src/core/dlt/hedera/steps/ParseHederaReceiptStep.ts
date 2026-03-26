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

import { Client } from '@hiero-ledger/sdk';
import { ExecutionContext } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger } from '../../../Logger.js';

export class ParseHederaReceiptStep implements ExecutionStep {
  readonly name = 'ParseHederaReceipt';

  constructor(private readonly client: Client) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    // getRecord() includes contractFunctionResult.logs (EVM events) needed for result extraction.
    // It is a superset of getReceipt() — receipt.status still works the same way.
    const receipt = await ctx.response.getRecord(this.client);
    const status = receipt.receipt?.status?.toString() ?? 'unknown';
    const gasUsed = receipt.contractFunctionResult?.gasUsed;
    const logsCount = receipt.contractFunctionResult?.logs?.length ?? 0;
    logger.step(`     status=${status}${gasUsed ? ` gas=${gasUsed}` : ''} logs=${logsCount}`);
    return { ...ctx, receipt };
  }
}
