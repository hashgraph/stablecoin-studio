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

import {
  FireblocksSDK,
  PeerType,
  TransactionOperation,
  TransactionResponse,
  TransactionStatus,
} from 'fireblocks-sdk';
import { CreateTransactionResponse } from 'fireblocks-sdk/dist/src/types';
import { ISignatureStrategy } from '../signature/ISignatureStrategy.js';
import { FireblocksConfig } from '../config/FireblocksConfig.js';
import { SignatureRequest } from '../../models/signature/SignatureRequest.js';
import { hexStringToUint8Array } from '../../utils/utilities.js';

const MAX_RETRIES = 10;
const POLL_INTERVAL = 1000;

/**
 * Represents a signature strategy using the Fireblocks SDK.
 */
export class FireblocksStrategy implements ISignatureStrategy {
  private fireblocks: FireblocksSDK;
  private config: FireblocksConfig;

  /**
   * Constructs a new instance of the FireblocksStrategy class.
   * @param strategyConfig The configuration for the Fireblocks strategy.
   */
  constructor(strategyConfig: FireblocksConfig) {
    this.fireblocks = new FireblocksSDK(
      strategyConfig.apiSecretKey,
      strategyConfig.apiKey,
      strategyConfig.baseUrl,
    );
    this.config = strategyConfig;
  }

  /**
   * Signs a signature request using the Fireblocks SDK.
   * @param request The signature request to sign.
   * @returns A promise that resolves to the signature as a Uint8Array.
   */
  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signMessage(serializedTransaction);
    return hexStringToUint8Array(signatureHex);
  }

  /**
   * Signs a message using the Fireblocks SDK.
   * @param message The message to sign.
   * @returns A promise that resolves to the signature as a string.
   */
  private async signMessage(message: string): Promise<string> {
    const { id } = await this.createFireblocksTransaction(message);
    const txInfo = await this.pollTransaction(id);

    if (!txInfo.signedMessages || txInfo.signedMessages.length === 0) {
      throw new Error('No signature found in transaction response.');
    }

    const signature = txInfo.signedMessages[0].signature;
    return signature.fullSig;
  }

  /**
   * Polls a Fireblocks transaction until it is completed or failed.
   * @param transactionId The ID of the transaction to poll.
   * @returns A promise that resolves to the transaction response.
   * @throws An error if the transaction does not complete within the expected time frame.
   */
  private async pollTransaction(
    transactionId: string,
  ): Promise<TransactionResponse> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const txInfo = await this.fireblocks.getTransactionById(transactionId);
        if (
          [TransactionStatus.COMPLETED, TransactionStatus.FAILED].includes(
            txInfo.status,
          )
        ) {
          return txInfo;
        }
      } catch (err) {
        console.log(`Error polling transaction ${transactionId}:`, err);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
    throw new Error(
      `Transaction ${transactionId} did not complete within the expected time frame.`,
    );
  }

  /**
   * Creates a Fireblocks transaction for signing a message.
   * @param message The message to include in the transaction.
   * @returns A promise that resolves to the created transaction response.
   */
  private async createFireblocksTransaction(
    message: string,
  ): Promise<CreateTransactionResponse> {
    return await this.fireblocks.createTransaction({
      operation: TransactionOperation.RAW,
      assetId: this.config.assetId,
      source: { type: PeerType.VAULT_ACCOUNT, id: this.config.vaultAccountId },
      extraParameters: { rawMessageData: { messages: [{ content: message }] } },
    });
  }
}
