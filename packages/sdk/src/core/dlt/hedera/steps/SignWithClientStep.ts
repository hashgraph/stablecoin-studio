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

import { Client, ContractExecuteTransaction, PrivateKey, PublicKey } from '@hiero-ledger/sdk';
import { ExecutionContext } from '../../../types/ExecutionContext.js';
import { ExecutionStep } from '../../base/ExecutionStep.js';
import { logger, maskKey } from '../../../Logger.js';

export class SignWithClientStep implements ExecutionStep {
  readonly name = 'SignWithClient';

  constructor(
    private readonly client: Client,
    private readonly privateKey?: PrivateKey,
  ) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const tx = ctx.transaction as ContractExecuteTransaction;
    const frozen = tx.freezeWith(this.client);
    // When using ClientInstanceSigning the operator key is already on the Client,
    // so an explicit .sign() is not needed (and calling .sign(undefined) throws).
    const signed = this.privateKey ? await frozen.sign(this.privateKey) : frozen;
    let keyInfo = 'operator key';
    try {
      if (this.privateKey) {
        const raw = this.privateKey.toStringRaw();
        const pub = this.privateKey.publicKey;
        const keyType = pub instanceof PublicKey && pub.toStringDer().startsWith('302a')
          ? 'ED25519' : 'ECDSA';
        keyInfo = `${keyType} ${maskKey(raw)}`;
      }
    } catch { /* mock-safe */ }
    logger.step(`     signer=${this.client.operatorAccountId} key=${keyInfo} via=Hedera SDK`);
    const signedTransaction = { kind: 'hedera' as const, transaction: signed };
    return { ...ctx, signedTransaction };
  }
}
