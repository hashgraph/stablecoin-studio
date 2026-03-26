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

import { ExecutionContext, SerializedTx } from '../../types/ExecutionContext.js';
import { ExecutionStep } from '../base/ExecutionStep.js';
import { logger } from '../../Logger.js';

export interface ExternalSigningClient {
  sign(bytes: Uint8Array): Promise<Uint8Array>;
}

export class SignWithExternalStep implements ExecutionStep {
  readonly name = 'SignWithExternal';

  constructor(private readonly externalClient: ExternalSigningClient) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const signedBytes = await this.externalClient.sign(serialized.transactionBytes);
    logger.step(`     key=external (custodial) via=Hedera SDK, input=${serialized.transactionBytes.length} bytes → signed=${signedBytes.length} bytes`);
    const signedTransaction: SerializedTx = {
      kind: 'serialized',
      transactionBytes: signedBytes,
      bodyBytes: serialized.bodyBytes,
    };
    return { ...ctx, signedTransaction };
  }
}
