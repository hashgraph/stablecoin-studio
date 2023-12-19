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
  DFNS_APP_ID,
  DFNS_APP_ORIGIN,
  DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
  DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
  DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
  DFNS_TEST_URL,
  DFNS_WALLET_ID,
  dfnsConfig,
  FIREBLOCKS_API_KEY,
  FIREBLOCKS_API_SECRET_KEY,
  FIREBLOCKS_ASSET_ID,
  FIREBLOCKS_BASE_URL,
  FIREBLOCKS_VAULT,
  fireblocksConfig,
  TEST_TIMEOUT,
} from '../utils/config';
import {
  DFNSConfig,
  FireblocksConfig,
  SignatureRequest,
} from '../../src/index.js';

const signatureRequest = new SignatureRequest(new Uint8Array([1, 2, 3]));

describe('🧪 Service TESTS', () => {
  describe('Configuration', () => {
    it(
      'Get configuration from service instance (Fireblocks)',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        const config = signatureService.getConfig();

        expect(config instanceof FireblocksConfig).toEqual(true);
        expect((config as FireblocksConfig).apiKey).toEqual(FIREBLOCKS_API_KEY);
        expect((config as FireblocksConfig).apiSecretKey).toEqual(
          FIREBLOCKS_API_SECRET_KEY,
        );
        expect((config as FireblocksConfig).baseUrl).toEqual(
          FIREBLOCKS_BASE_URL,
        );
        expect((config as FireblocksConfig).vaultAccountId).toEqual(
          FIREBLOCKS_VAULT,
        );
        expect((config as FireblocksConfig).assetId).toEqual(
          FIREBLOCKS_ASSET_ID,
        );
      },
      TEST_TIMEOUT,
    );

    it(
      'Set configuration to service instance (Fireblocks)',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        signatureService.setConfig(dfnsConfig);
        const config = signatureService.getConfig();

        expect(config instanceof DFNSConfig).toEqual(true);
        expect((config as DFNSConfig).serviceAccountPrivateKey).toEqual(
          DFNS_SERVICE_ACCOUNT_PRIVATE_KEY,
        );
        expect((config as DFNSConfig).serviceAccountCredentialId).toEqual(
          DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID,
        );
        expect((config as DFNSConfig).serviceAccountAuthToken).toEqual(
          DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN,
        );
        expect((config as DFNSConfig).appOrigin).toEqual(DFNS_APP_ORIGIN);
        expect((config as DFNSConfig).appId).toEqual(DFNS_APP_ID);
        expect((config as DFNSConfig).baseUrl).toEqual(DFNS_TEST_URL);
        expect((config as DFNSConfig).walletId).toEqual(DFNS_WALLET_ID);
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
