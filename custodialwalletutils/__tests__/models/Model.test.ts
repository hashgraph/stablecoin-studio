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
  TEST_TIMEOUT,
  FIREBLOCKS_VAULT,
  DFNS_WALLET_ID,
} from '../utils/config';
import { FireblocksSignatureRequest } from '../../src/models/signature/FireblocksSignatureRequest';
import { DFNSSignatureRequest } from '../../src/models/signature/DFNSSignatureRequest';

describe('🧪 Models TESTS', () => {
  describe('[Fireblocks] Signatures Request', () => {
    it(
      'build request',
      () => {
        let message = new Uint8Array([1, 2, 3]);

        const fireblocksSignatureRequest = new FireblocksSignatureRequest(
          FIREBLOCKS_VAULT,
          message,
        );

        expect(fireblocksSignatureRequest.getVaultAccountId()).toEqual(
          FIREBLOCKS_VAULT,
        );
        expect(fireblocksSignatureRequest.getTransactionBytes()).toEqual(
          message,
        );

        message = new Uint8Array([4, 5, 6]);

        fireblocksSignatureRequest.setVaultAccountId('');
        fireblocksSignatureRequest.setTransactionBytes(message);

        expect(fireblocksSignatureRequest.getVaultAccountId()).toEqual('');
        expect(fireblocksSignatureRequest.getTransactionBytes()).toEqual(
          message,
        );
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures Request', () => {
    it(
      'build request',
      () => {
        let message = new Uint8Array([1, 2, 3]);

        const dfnsSignatureRequest = new DFNSSignatureRequest(
          DFNS_WALLET_ID,
          message,
        );

        expect(dfnsSignatureRequest.getWalletId()).toEqual(DFNS_WALLET_ID);
        expect(dfnsSignatureRequest.getTransactionBytes()).toEqual(message);

        message = new Uint8Array([4, 5, 6]);

        dfnsSignatureRequest.setWalletId('');
        dfnsSignatureRequest.setTransactionBytes(message);

        expect(dfnsSignatureRequest.getWalletId()).toEqual('');
        expect(dfnsSignatureRequest.getTransactionBytes()).toEqual(message);
      },
      TEST_TIMEOUT,
    );
  });
});
