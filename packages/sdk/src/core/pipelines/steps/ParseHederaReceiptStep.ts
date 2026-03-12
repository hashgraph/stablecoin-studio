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
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class ParseHederaReceiptStep implements PipelineStep {
  readonly name = 'ParseHederaReceipt';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const receipt = await ctx.response.getReceipt(this.client);
    return { ...ctx, receipt };
  }
}
