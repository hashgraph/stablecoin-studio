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

import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { DFNSSignatureRequest } from '../../src/index.js';
import {
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  fireblocksConfig,
  DFNS_WALLET_ID,
  dfnsConfig,
} from '../utils/config';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy.js';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy.js';

describe('Strategy TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    it(
      'Sign bunch of bytes',
      async () => {
        const message = new Uint8Array([1, 2, 3]);

        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          message,
        );

        const fireblocksSignatureStrategy = new FireblocksStrategy(
          fireblocksConfig,
        );

        const signedMessage = await fireblocksSignatureStrategy.sign(
          fireblocksSignatureRequest,
        );

        expect(signedMessage.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    it(
      'Sign bunch of bytes',
      async () => {
        const message = new Uint8Array([1, 2, 3]);

        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          message,
        );

        const dfnsSignatureStrategy = new DFNSStrategy(dfnsConfig);

        const signedMessage = await dfnsSignatureStrategy.sign(
          dfnsSignatureRequest,
        );

        expect(signedMessage.length).toBeGreaterThan(0);
      },
      TEST_TIMEOUT,
    );
  });
});
