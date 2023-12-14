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

/* eslint-disable jest/no-conditional-expect */

import { CustodialWalletService } from '../../src/services/CustodialWalletService';
import {
  TEST_TIMEOUT,
  fireblocksConfig,
  dfnsConfig,
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_VAULT,
  FIREBLOCKS_BASE_URL,
  FIREBLOCKS_API_SECRET_KEY,
  DFNS_WALLET_ID,
  DFNS_TEST_URL,
  DFNS_APP_ID,
  DFNS_APP_ORIGIN,
  DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
  DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
  DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
} from '../utils/config';
import { DFNSConfig, FireblocksConfig, SignatureRequest } from '../../src/index.js';

const signatureRequest = new SignatureRequest(
  new Uint8Array([1, 2, 3]),
);

describe('Service TESTS', () => {
  describe('Configuration', () => {
    it(
      'Get configuration',
      async () => {
        // arrange
        const signatureService = new CustodialWalletService(fireblocksConfig);

        // act
        const config = await signatureService.getconfig();

        // assert
        expect(config instanceof FireblocksConfig);
        expect((config as  FireblocksConfig).apiKey).toEqual(FIREBLOCKS_API_KEY);
        expect((config as  FireblocksConfig).apiSecretKey).toEqual(FIREBLOCKS_API_SECRET_KEY);
        expect((config as  FireblocksConfig).baseUrl).toEqual(FIREBLOCKS_BASE_URL);
        expect((config as  FireblocksConfig).vaultAccountId).toEqual(FIREBLOCKS_VAULT);

      },
      TEST_TIMEOUT,
    );

    it(
      'Set configuration',
      async () => {
        // arrange
        const signatureService = new CustodialWalletService(fireblocksConfig);

        // act
        await signatureService.setconfig(dfnsConfig);
        const config = await signatureService.getconfig();

        // assert
        expect(config instanceof DFNSConfig);
        expect((config as  DFNSConfig).serviceAccountPrivateKey).toEqual(DFNS_SERVICE_ACCOUNT_PRIVATE_KEY);
        expect((config as  DFNSConfig).serviceAccountCredentialId).toEqual(DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID);
        expect((config as  DFNSConfig).serviceAccountAuthToken).toEqual(DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN);
        expect((config as  DFNSConfig).appOrigin).toEqual(DFNS_APP_ORIGIN);
        expect((config as  DFNSConfig).appId).toEqual(DFNS_APP_ID);
        expect((config as  DFNSConfig).baseUrl).toEqual(DFNS_TEST_URL);
        expect((config as  DFNSConfig).walletId).toEqual(DFNS_WALLET_ID);

      },
      TEST_TIMEOUT,
    );

  });
  describe('[Fireblocks] Signatures', () => {
    it(
      'Sign bunch of bytes',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);
        const signature = await signatureService.signTransaction(
          signatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    it(
      'Sign bunch of bytes',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);
        const signature = await signatureService.signTransaction(
          signatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
