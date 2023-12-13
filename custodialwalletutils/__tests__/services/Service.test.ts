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

import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { CustodialWalletService } from '../../src/services/CustodialWalletService';
import {
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  DFNS_WALLET_ID,
  fireblocksConfig,
  dfnsConfig,
} from '../utils/config';
import { DFNSSignatureRequest } from '../../src/index.js';

describe('Service TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    it(
      'Try Sign bunch of bytes Using the wrong request',
      async () => {
        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(fireblocksConfig);
        try {
          await signatureService.signTransaction(dfnsSignatureRequest);
          expect(false).toEqual(true);
        } catch (e) {
          expect(true).toEqual(true);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'Sign bunch of bytes',
      async () => {
        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(fireblocksConfig);
        const signature = await signatureService.signTransaction(
          fireblocksSignatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    it(
      'Try Sign bunch of bytes Using the wrong request',
      async () => {
        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(dfnsConfig);
        try {
          await signatureService.signTransaction(fireblocksSignatureRequest);
          expect(false).toEqual(true);
        } catch (e) {
          expect(true).toEqual(true);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'Sign bunch of bytes',
      async () => {
        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          new Uint8Array([1, 2, 3]),
        );
        const signatureService = new CustodialWalletService(dfnsConfig);
        const signature = await signatureService.signTransaction(
          dfnsSignatureRequest,
        );
        expect(signature.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
