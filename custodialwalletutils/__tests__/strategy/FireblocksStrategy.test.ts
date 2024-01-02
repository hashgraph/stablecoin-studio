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
  PeerType,
  TransactionResponse,
  TransactionStatus,
} from 'fireblocks-sdk';
import {
  FireblocksConfig,
  FireblocksStrategy,
  hexStringToUint8Array,
  SignatureRequest,
} from '../../src';
import { TransferPeerPathResponse } from 'fireblocks-sdk/dist/src/types';

const signatureResponse = {
  status: TransactionStatus.COMPLETED,
  id: 'transaction-id',
  signedMessages: [{ signature: { fullSig: 'signature-string' } }],
};

jest.mock('fireblocks-sdk', () => {
  // Require the original module to not be mocked...
  const actualSdk = jest.requireActual('fireblocks-sdk');
  return {
    ...actualSdk,
    FireblocksSDK: jest.fn().mockImplementation(() => ({
      createTransaction: jest.fn().mockResolvedValue(signatureResponse),
      getTransactionById: jest.fn().mockResolvedValue(signatureResponse),
    })),
  };
});

describe('🧪 FireblocksStrategy TESTS', () => {
  let fireblocksStrategy: FireblocksStrategy;

  beforeEach(() => {
    fireblocksStrategy = setupFireblocksStrategy();
    jest.spyOn(fireblocksStrategy['fireblocks'], 'createTransaction');
    jest.spyOn(fireblocksStrategy['fireblocks'], 'getTransactionById');
  });

  it('should correctly sign a correct signature request', async () => {
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3]),
    );
    const result = await fireblocksStrategy.sign(mockSignatureRequest);

    expect(
      fireblocksStrategy['fireblocks']['createTransaction'],
    ).toHaveBeenCalledTimes(1);
    expect(
      fireblocksStrategy['fireblocks']['getTransactionById'],
    ).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      hexStringToUint8Array(
        signatureResponse.signedMessages[0].signature.fullSig,
      ),
    );
  });

  it('should throw an error if fireblocks cant get the transaction', async () => {
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3]),
    );
    jest
      .spyOn(fireblocksStrategy['fireblocks'], 'createTransaction')
      .mockRejectedValue(new Error('someError'));
    await expect(fireblocksStrategy.sign(mockSignatureRequest)).rejects.toThrow(
      'someError',
    );
  });

  it('should throw an error if signed message is empty', async () => {
    const peerType: PeerType = PeerType.VAULT_ACCOUNT;
    const transferPeerPathResponse: TransferPeerPathResponse = {
      id: 'peer-id',
      type: peerType,
    };
    const signatureResponse: TransactionResponse = {
      addressType: '',
      amount: 0,
      amountUSD: 0,
      assetId: '',
      createdAt: 0,
      createdBy: '',
      destination: transferPeerPathResponse,
      destinationAddress: '',
      destinationTag: '',
      exchangeTxId: '',
      feeCurrency: '',
      lastUpdated: 0,
      netAmount: 0,
      networkFee: 0,
      note: '',
      rejectedBy: '',
      requestedAmount: 0,
      signedBy: [],
      source: transferPeerPathResponse,
      txHash: '',
      status: TransactionStatus.FAILED,
      id: 'transaction-id',
      signedMessages: [],
    };
    const mockSignatureRequest = new SignatureRequest(new Uint8Array([]));
    jest
      .spyOn(fireblocksStrategy['fireblocks'], 'getTransactionById')
      .mockResolvedValue(signatureResponse);
    await expect(fireblocksStrategy.sign(mockSignatureRequest)).rejects.toThrow(
      'No signature found in transaction response.',
    );
  });

  it('should throw an error if the transaction does not complete within the expected time frame', async () => {
    const signatureResponse = {
      status: TransactionStatus.PENDING_SIGNATURE,
      id: 'transaction-id',
      signedMessages: [],
    };
    const mockSignatureRequest = new SignatureRequest(
      new Uint8Array([1, 2, 3]),
    );
    jest
      .spyOn(fireblocksStrategy['fireblocks'], 'getTransactionById')
      .mockRejectedValue(signatureResponse);
    await expect(fireblocksStrategy.sign(mockSignatureRequest)).rejects.toThrow(
      `Transaction ${signatureResponse.id} did not complete within the expected time frame.`,
    );
  }, 11000);
});

const setupFireblocksStrategy = (): FireblocksStrategy => {
  return new FireblocksStrategy(
    new FireblocksConfig(
      'mockedApiSecretKey',
      'mockedApiKey',
      'mockedBaseUrl',
      'mockedVaultAccountId',
      'mockedAssetId',
    ),
  );
};
