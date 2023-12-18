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

import {FireblocksSDK, TransactionStatus} from "fireblocks-sdk";
import {FireblocksStrategy} from "../../src/strategies/signature/FireblocksStrategy";
import {FireblocksConfig, SignatureRequest} from "../../src";
import {hexStringToUint8Array} from "../../src/utils/utilities";

const signatureResponse = {
    status: TransactionStatus.COMPLETED,
    id: 'transaction-id',
    signedMessages: [{ signature: { fullSig: 'signature-string' } }]
}

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

describe('FireblocksStrategy', () => {
    let fireblocksStrategy: FireblocksStrategy;
    let mockFireblocksSDK: FireblocksSDK;

    beforeEach(() => {
        const mockStrategyConfig = new FireblocksConfig(
             'mockedApiSecretKey',
             'mockedApiKey',
             'mockedBaseUrl',
            'mockedVaultAccountId'
        );
        mockFireblocksSDK = new FireblocksSDK(
            mockStrategyConfig.apiSecretKey,
            mockStrategyConfig.apiKey,
            mockStrategyConfig.baseUrl,
        );

        jest.spyOn(mockFireblocksSDK, 'createTransaction');
        jest.spyOn(mockFireblocksSDK, 'getTransactionById');

        fireblocksStrategy = new FireblocksStrategy(mockStrategyConfig);
    });

    it('should correctly sign a signature request', async () => {
        const mockSignatureRequest = new SignatureRequest(new Uint8Array([1, 2, 3]));
        const result = await fireblocksStrategy.sign(mockSignatureRequest);

        // expect(mockFireblocksSDK.createTransaction).toHaveBeenCalledTimes(1);
        // expect(mockFireblocksSDK.getTransactionById).toHaveBeenCalledTimes(1);
        expect(result).toEqual(hexStringToUint8Array(signatureResponse.signedMessages[0].signature.fullSig));
    });
});