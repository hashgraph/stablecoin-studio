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

import {SignatureRequest} from '../../models/signature/SignatureRequest';
import {ISignatureStrategy} from './ISignatureStrategy';
import {FireblocksSDK, PeerType, TransactionOperation, TransactionStatus,} from 'fireblocks-sdk';
import {FireblocksConfig} from '../config/FireblocksConfig';
import {hexStringToUint8Array} from '../../utils/utilities';
import {CreateTransactionResponse} from "fireblocks-sdk/dist/src/types";

const MAX_RETRIES = 5;
const POLL_INTERVAL = 1000;

export class FireblocksStrategy implements ISignatureStrategy {
  private fireblocks: FireblocksSDK;
  private config: FireblocksConfig;

  constructor(strategyConfig: FireblocksConfig) {
    this.fireblocks = new FireblocksSDK(
      strategyConfig.apiSecretKey,
      strategyConfig.apiKey,
      strategyConfig.baseUrl,
    );
    this.config = strategyConfig;
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signMessage(serializedTransaction);
    return hexStringToUint8Array(signatureHex);
  }

  private async signMessage(message: string): Promise<string> {
    const {id} = await this.createFireblocksTransaction(message);
    await this.waitForTransactionCompletion(id);
    return await this.extractSignature(id);
  }

  private async createFireblocksTransaction(message: string): Promise<CreateTransactionResponse> {
    return await this.fireblocks.createTransaction({
      operation: TransactionOperation.RAW,
      assetId: 'HBAR_TEST',
      source: { type: PeerType.VAULT_ACCOUNT, id: this.config.vaultAccountId },
      extraParameters: { rawMessageData: { messages: [{ content: message }] } },
    });
  }

  private async waitForTransactionCompletion(transactionId: string): Promise<void> {

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const txInfo = await this.fireblocks.getTransactionById(transactionId);
        if ([TransactionStatus.COMPLETED, TransactionStatus.FAILED].includes(txInfo.status)) {
          return;
        }
      } catch (err) {
        console.error('Error polling transaction:', err);
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error(`Transaction ${transactionId} did not complete within the expected time frame.`);
  }


  private async extractSignature(transactionId: string): Promise<string> {
    const txInfo = await this.fireblocks.getTransactionById(transactionId);
    if (!txInfo || !txInfo.signedMessages || txInfo.signedMessages.length === 0) {
      throw new Error('Transaction information is incomplete or missing.');
    }

    const signature = txInfo.signedMessages[0].signature;
    return signature.fullSig;
  }
}
