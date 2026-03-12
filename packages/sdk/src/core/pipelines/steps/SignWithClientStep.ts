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

export class SignWithClientStep implements PipelineStep {
  readonly name = 'SignWithClient';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const tx = ctx.transaction as any;
    const frozen = tx.freezeWith(this.client);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientAny = this.client as any;
    const privateKey = clientAny._operator?.privateKey ?? clientAny.operatorKey;
    const signed = await frozen.sign(privateKey);
    const signedTransaction = { kind: 'hedera' as const, transaction: signed };
    return { ...ctx, signedTransaction };
  }
}
