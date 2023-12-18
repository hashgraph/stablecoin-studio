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

const mockGenerateSignature = jest.fn().mockResolvedValue(signatureResponse)

const mockGetSignature = jest.fn().mockResolvedValue(
    signatureResponse
)

const mockDfnsApiClient = jest.fn().mockImplementation(() => ({
    wallets: {
        generateSignature: mockGenerateSignature,
        getSignature: mockGetSignature,
    },
}))

jest.mock('@dfns/sdk', () => {
    return {
        DfnsApiClient: mockDfnsApiClient,
    };
});

describe('DFNSStrategy', () => {
    let dfnsStrategy: DFNSStrategy;
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

        dfnsStrategy = new DFNSStrategy(mockStrategyConfig);

        jest.spyOn(dfnsStrategy['dfnsApiClient']['wallets'], 'generateSignature');
        jest.spyOn(dfnsStrategy['dfnsApiClient']['wallets'], 'getSignature');
    });

    afterEach(() => {
        mockGenerateSignature.mockReset()
        mockGenerateSignature.mockReset()
    })

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

        // expect(mockGenerateSignature).toHaveBeenCalledTimes(1);
        //   expect(mockDfnsApiClient.wallets.generateSignature).toHaveBeenCalledWith(expectedGenerateSignatureRequest);
        //       expect(mockGenerateSignature).toHaveBeenCalledTimes(1);
        const expectedSignatureResponse = hexStringToUint8Array(Buffer.from(
            signatureResponse.signature.r.substring(2) + signatureResponse.signature.s.substring(2),
            'hex',
        ).toString('hex'));
        expect(mockGenerateSignature).toHaveBeenCalledTimes(1);
        expect(mockGenerateSignature).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedSignatureResponse);
    });

});

