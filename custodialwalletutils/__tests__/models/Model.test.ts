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

import {TEST_TIMEOUT} from '../utils/config';
import {SignatureRequest} from '../../src';

describe('🧪 Models TESTS', () => {
  describe('Signatures Request', () => {
    it(
      'Get Transaction',
      () => {
        const message = new Uint8Array([1, 2, 3]);

        const signatureRequest = new SignatureRequest(message);

        const retrievedMessage = signatureRequest.getTransactionBytes();

        expect(retrievedMessage.length).toEqual(message.length);

        for (let i = 0; i < message.length; i++) {
          expect(retrievedMessage[i]).toEqual(message[i]);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'Set Transaction',
      () => {
        const message = new Uint8Array([1, 2, 3]);

        const signatureRequest = new SignatureRequest(message);

        const message_two = new Uint8Array([4, 5, 6, 7]);

        signatureRequest.setTransactionBytes(message_two);

        const retrievedMessage = signatureRequest.getTransactionBytes();

        expect(retrievedMessage.length).toEqual(message_two.length);

        for (let i = 0; i < message_two.length; i++) {
          expect(retrievedMessage[i]).toEqual(message_two[i]);
        }
      },
      TEST_TIMEOUT,
    );
  });
});
