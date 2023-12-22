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

import {CustodialWalletService, DFNSConfig, FireblocksConfig, SignatureRequest,} from '../../src'; // Replace '@src' with the actual file path of the module being imported
import {dfnsConfig, fireblocksConfig, TEST_TIMEOUT} from '../utils/config';

const signatureRequest = new SignatureRequest(new Uint8Array([1, 2, 3]));

describe('🧪 Service TESTS', () => {
  describe('Configuration', () => {
    it(
      '[Fireblocks] Get configuration from service instance',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        const config = signatureService.getConfig() as FireblocksConfig;

        expect(config).toBeInstanceOf(FireblocksConfig);
        expect(config.apiKey).toEqual(fireblocksConfig.apiKey);
        expect(config.apiSecretKey).toEqual(fireblocksConfig.apiSecretKey);
        expect(config.baseUrl).toEqual(fireblocksConfig.baseUrl);
        expect(config.vaultAccountId).toEqual(fireblocksConfig.vaultAccountId);
        expect(config.assetId).toEqual(fireblocksConfig.assetId);
      },
      TEST_TIMEOUT,
    );

    it(
      '[DFNS] Get configuration from service instance',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);

        const config = signatureService.getConfig() as DFNSConfig;

        expect(config).toBeInstanceOf(DFNSConfig);
        expect(config.serviceAccountPrivateKey).toEqual(
          dfnsConfig.serviceAccountPrivateKey,
        );
        expect(config.serviceAccountCredentialId).toEqual(
          dfnsConfig.serviceAccountCredentialId,
        );
        expect(config.serviceAccountAuthToken).toEqual(
          dfnsConfig.serviceAccountAuthToken,
        );
        expect(config.appOrigin).toEqual(dfnsConfig.appOrigin);
        expect(config.appId).toEqual(dfnsConfig.appId);
        expect(config.baseUrl).toEqual(dfnsConfig.baseUrl);
        expect(config.walletId).toEqual(dfnsConfig.walletId);
      },
      TEST_TIMEOUT,
    );

    it(
      'Set configuration to service instance Fireblocks -> DFNS',
      async () => {
        const signatureService = new CustodialWalletService(fireblocksConfig);

        signatureService.setConfig(dfnsConfig);
        const config = signatureService.getConfig() as DFNSConfig;

        expect(config).toBeInstanceOf(DFNSConfig);
        expect(config.serviceAccountPrivateKey).toEqual(
          dfnsConfig.serviceAccountPrivateKey,
        );
        expect(config.serviceAccountCredentialId).toEqual(
          dfnsConfig.serviceAccountCredentialId,
        );
        expect(config.serviceAccountAuthToken).toEqual(
          dfnsConfig.serviceAccountAuthToken,
        );
        expect(config.appOrigin).toEqual(dfnsConfig.appOrigin);
        expect(config.appId).toEqual(dfnsConfig.appId);
        expect(config.baseUrl).toEqual(dfnsConfig.baseUrl);
        expect(config.walletId).toEqual(dfnsConfig.walletId);
      },
      TEST_TIMEOUT,
    );

    it(
      'Set configuration to service instance DFNS -> Fireblocks',
      async () => {
        const signatureService = new CustodialWalletService(dfnsConfig);

        signatureService.setConfig(fireblocksConfig);
        const config = signatureService.getConfig() as FireblocksConfig;

        expect(config).toBeInstanceOf(FireblocksConfig);
        expect(config.apiKey).toEqual(fireblocksConfig.apiKey);
        expect(config.apiSecretKey).toEqual(fireblocksConfig.apiSecretKey);
        expect(config.baseUrl).toEqual(fireblocksConfig.baseUrl);
        expect(config.vaultAccountId).toEqual(fireblocksConfig.vaultAccountId);
        expect(config.assetId).toEqual(fireblocksConfig.assetId);
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
