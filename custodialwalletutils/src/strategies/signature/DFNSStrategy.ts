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

import { ISignatureStrategy } from './ISignatureStrategy';
import { SignatureRequest } from '../../models/signature/SignatureRequest';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { DfnsApiClient } from '@dfns/sdk';
import { DFNSConfig } from '../config/DFNSConfig';
import {
  SignatureKind,
  SignatureStatus,
} from '@dfns/sdk/codegen/datamodel/Wallets';
import { hexStringToUint8Array } from '../../utils/utilities';
import { DfnsWalletOptions } from '../../utils/DFNSWallet';

const sleep = (interval = 0) =>
  new Promise((resolve) => setTimeout(resolve, interval));
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_INTERVAL = 2000;

export class DFNSStrategy implements ISignatureStrategy {
  private readonly dfnsApiClient: DfnsApiClient;
  private readonly dfnsWalletOptions: DfnsWalletOptions;
  private config: DFNSConfig;

  constructor(private strategyConfig: DFNSConfig) {
    this.dfnsApiClient = this.createDfnsApiClient(strategyConfig);
    this.dfnsWalletOptions = this.createDfnsWalletOptions();
    this.config = strategyConfig;
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
      signer: signer,
    });
  }

  private createDfnsWalletOptions(): DfnsWalletOptions {
    return {
      walletId: this.strategyConfig.walletId,
      dfnsClient: this.dfnsApiClient,
      maxRetries: DEFAULT_MAX_RETRIES,
      retryInterval: DEFAULT_RETRY_INTERVAL,
    };
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signMessage(serializedTransaction);
    return hexStringToUint8Array(signatureHex);
  }

  async signMessage(message: string): Promise<string> {
    const { walletId, dfnsClient } = this.dfnsWalletOptions;
    const response = await dfnsClient.wallets.generateSignature({
      walletId,
      body: { kind: SignatureKind.Message, message: `0x${message}` },
    });

    return this.waitForSignature(response.id);
  }

  async waitForSignature(signatureId: string): Promise<string> {
    const {
      walletId,
      dfnsClient,
      maxRetries = 3,
      retryInterval = 1000,
    } = this.dfnsWalletOptions;

    for (let retries = maxRetries; retries > 0; retries--) {
      const response = await dfnsClient.wallets.getSignature({
        walletId,
        signatureId,
      });

      if (response.status === SignatureStatus.Signed && response.signature) {
        return Buffer.from(
          response.signature.r.substring(2) + response.signature.s.substring(2),
          'hex',
        ).toString('hex');
      } else if (response.status === SignatureStatus.Failed) {
        break;
      }

      await sleep(retryInterval);
    }

    throw new Error(`DFNS Signature request ${signatureId} failed.`);
  }
}
