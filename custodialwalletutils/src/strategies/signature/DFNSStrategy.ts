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

import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { DfnsApiClient } from '@dfns/sdk';
import {
  SignatureKind,
  SignatureStatus,
} from '@dfns/sdk/codegen/datamodel/Wallets';
import {
  DFNSConfig,
  ISignatureStrategy,
  SignatureRequest,
  hexStringToUint8Array,
} from '../../';

const sleep = (interval = 0) =>
  new Promise((resolve) => setTimeout(resolve, interval));
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_INTERVAL = 1000;

export class DFNSStrategy implements ISignatureStrategy {
  private readonly dfnsApiClient: DfnsApiClient;
  private readonly walletId: string;

  constructor(strategyConfig: DFNSConfig) {
    this.dfnsApiClient = this.createDfnsApiClient(strategyConfig);
    this.walletId = strategyConfig.walletId;
  }

  private createDfnsApiClient(strategyConfig: DFNSConfig): DfnsApiClient {
    const signer = new AsymmetricKeySigner({
      privateKey: strategyConfig.serviceAccountPrivateKey,
      credId: strategyConfig.serviceAccountCredentialId,
      appOrigin: strategyConfig.appOrigin,
    });

    return new DfnsApiClient({
      appId: strategyConfig.appId,
      authToken: strategyConfig.serviceAccountAuthToken,
      baseUrl: strategyConfig.baseUrl,
      signer,
    });
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signMessage(serializedTransaction);
    return hexStringToUint8Array(signatureHex);
  }

  async signMessage(message: string): Promise<string> {
    const response = await this.dfnsApiClient.wallets.generateSignature({
      walletId: this.walletId,
      body: { kind: SignatureKind.Message, message: `0x${message}` },
    });

    return this.waitForSignature(response.id);
  }

  async waitForSignature(signatureId: string): Promise<string> {
    for (let retries = DEFAULT_MAX_RETRIES; retries > 0; retries--) {
      const response = await this.dfnsApiClient.wallets.getSignature({
        walletId: this.walletId,
        signatureId,
      });

      if (response.status === SignatureStatus.Signed && response.signature) {
        const signature = response.signature;
        const r = signature.r.substring(2);
        const s = signature.s.substring(2);
        return Buffer.from(r + s, 'hex').toString('hex');
      } else if (response.status === SignatureStatus.Failed) {
        break;
      }
      await sleep(DEFAULT_RETRY_INTERVAL);
    }
    throw new Error(`DFNS Signature request ${signatureId} failed.`);
  }
}
