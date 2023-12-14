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

import {ISignatureStrategy} from './ISignatureStrategy';
import {DFNSSignatureRequest} from '../../models/signature/DFNSSignatureRequest';
import {AsymmetricKeySigner} from '@dfns/sdk-keysigner';
import {DfnsApiClient, DfnsApiClientOptions} from '@dfns/sdk';
import {DFNSConfig} from '../StrategyConfig';
import {SignatureKind, SignatureStatus,} from '@dfns/sdk/codegen/datamodel/Wallets';
import {hexStringToUint8Array} from '../../utils/utilities';
import {DfnsWalletOptions} from '../../utils/DFNSWallet';

const sleep = (interval = 0) =>
  new Promise((resolve) => setTimeout(resolve, interval));

export class DFNSStrategy implements ISignatureStrategy {
  private signer: AsymmetricKeySigner;
  private dfnsApiClientOptions: DfnsApiClientOptions;
  private dfnsApiClient: DfnsApiClient;

  constructor(private strategyConfig: DFNSConfig) {
    this.signer = new AsymmetricKeySigner({
      privateKey: strategyConfig.privateKeyToCreateECDSAServiceAccount,
      credId: strategyConfig.dfnsEcdsaServiceaccountCredentialId,
      appOrigin: strategyConfig.dfnsAppOrigin,
    });

    this.dfnsApiClientOptions = {
      appId: strategyConfig.dfnsAppId,
      authToken: strategyConfig.dfnsEcdsaServiceAccountAuthToken,
      baseUrl: strategyConfig.dfnsTestUrl,
      signer: this.signer,
    };

    this.dfnsApiClient = new DfnsApiClient(this.dfnsApiClientOptions);

  }
  async sign(request: DFNSSignatureRequest): Promise<Uint8Array> {

    const dfnsWalletOptions: DfnsWalletOptions = {
      walletId: request.getWalletId(),
      dfnsClient: this.dfnsApiClient,
      maxRetries: 6,
      retryInterval: 2000,
    };

    const serializedTransaction = Buffer.from(request.getTransactionBytes()).toString('hex');
    const signature = await signMessage(serializedTransaction, dfnsWalletOptions);
    return hexStringToUint8Array(signature);
  }
}

async function signMessage(message: string, dfnsWalletOptions: DfnsWalletOptions): Promise<string> {
  const { walletId, dfnsClient } = dfnsWalletOptions;
  const res = await dfnsClient.wallets.generateSignature({
    walletId,
    body: { kind: SignatureKind.Message, message: `0x${message}` },
  });
  const signature = await waitForSignature(res.id, dfnsWalletOptions);
  return signature.toString('hex');
}

async function waitForSignature(signatureId: string, dfnsWalletOptions: DfnsWalletOptions) {
  const { walletId, dfnsClient } = dfnsWalletOptions;
  let maxRetries = dfnsWalletOptions.maxRetries ?? 3;
  const retryInterval = dfnsWalletOptions.retryInterval ?? 1000;

  do {
    const res = await dfnsClient.wallets.getSignature({
      walletId,
      signatureId,
    });
    if (res.status === SignatureStatus.Signed) {
      if (!res.signature) break;
      return Buffer.from(
        res.signature.r.substring(2).concat(res.signature.s.substring(2)),
        'hex',
      );
    } else if (res.status === SignatureStatus.Failed) {
      break;
    }
    maxRetries -= 1;
    await sleep(retryInterval);
  } while (maxRetries > 0);

  throw new Error(`DFNS Signature request ${signatureId} failed.`);
}
