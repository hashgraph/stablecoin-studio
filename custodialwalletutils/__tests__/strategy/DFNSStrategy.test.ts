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

import {DFNSConfig, SignatureRequest} from "../../src";
import {DFNSStrategy} from "../../src/strategies/signature/DFNSStrategy";
import {SignatureStatus} from "@dfns/sdk/codegen/datamodel/Wallets";
import {hexStringToUint8Array} from "../../src/utils/utilities";

const signatureResponse = {
    id: 'signature-id',
    status: SignatureStatus.Signed,
    signature: { r: '00r', s: '00s' },
}

jest.mock('@dfns/sdk', () => {
    return {
        DfnsApiClient: jest.fn().mockImplementation(() => ({
            wallets: {
                generateSignature: jest.fn().mockResolvedValue(signatureResponse),
                getSignature: jest.fn().mockResolvedValue(signatureResponse),
            },
        })),
    };
});

describe('DFNSStrategy', () => {
    let dfnsStrategy: DFNSStrategy;
    // let mockDfnsApiClient: DfnsApiClient;
    const walletId = 'wallet-id';

    beforeEach(() => {
        const mockStrategyConfig = new DFNSConfig(
            'mockedServiceAccountPrivateKey',
            'mockedServiceAccountCredentialId',
            'mockedServiceAccountAuthToken',
            'mockedAppOrigin',
            'mockedAppId',
            'mockedBaseUrl',
            walletId,
        );
        // const mockSigner = new AsymmetricKeySigner(
        //     {
        //         privateKey: mockStrategyConfig.serviceAccountPrivateKey,
        //         credId: mockStrategyConfig.serviceAccountCredentialId,
        //         appOrigin: mockStrategyConfig.appOrigin,
        //     }
        // );
        // mockDfnsApiClient = new DfnsApiClient({
        //     appId: mockStrategyConfig.appId,
        //     authToken: mockStrategyConfig.serviceAccountAuthToken,
        //     baseUrl: mockStrategyConfig.baseUrl,
        //     signer: mockSigner,
        // });

        dfnsStrategy = new DFNSStrategy(mockStrategyConfig);
    });

    it('should correctly sign a signature request', async () => {
        const mockSignatureRequest = new SignatureRequest(new Uint8Array([1, 2, 3]));
        const result = await dfnsStrategy.sign(mockSignatureRequest);
        // const serializedTransaction = Buffer.from(
        //     mockSignatureRequest.getTransactionBytes(),
        // ).toString('hex');
        // const expectedGenerateSignatureRequest = {
        //     walletId: walletId,
        //     body: { kind: SignatureKind.Message, message: `0x${serializedTransaction}` },
        // }

      // expect(mockDfnsApiClient.wallets.generateSignature).toHaveBeenCalledTimes(1);
    //   expect(mockDfnsApiClient.wallets.generateSignature).toHaveBeenCalledWith(expectedGenerateSignatureRequest);
 //       expect(mockDfnsApiClient.wallets.getSignature).toHaveBeenCalledTimes(1);
        const expectedSignatureResponse = hexStringToUint8Array(Buffer.from(
            signatureResponse.signature.r.substring(2) + signatureResponse.signature.s.substring(2),
            'hex',
        ).toString('hex'));
        expect(result).toEqual(expectedSignatureResponse);
    });
});

