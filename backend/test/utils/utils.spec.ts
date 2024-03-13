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

import { verifySignature } from '../../src/utils/utils';

const TEST_MESSAGE = 'message';
const INVALID_MESSAGE = 'invalid';

const ED25519 = {
  publicKey: '7B161574890615D4482612A369B0074A088622D2035A9884C54DBA0FF94B5D5C',
  signature:
    '79BC11D561386AD6D6DDF94F07D1F4C593854CE787D0AD5DA522E4AABCE1E4555B6297760D41D97E898A93E67D1CFED39B2C063FA98FE118B66B34D10A2DA406',
};

const ECDSA_SECP256K1 = {
  publicKey:
    '04904ecfa9307a605dd4028deab1d9aae9a63d7a33f6cb2a582b87c94b78d3b859f49dfb90bf5b2c1b185063dfad7ed46ade79ee0fd9c85f9d53b78eba6f2f9e47',
  signature:
    '30450221008259eed64047793b50e2c8770768ae46d10b6a8ab3db0c4c994d4021e8e7d1cc02206f9029228999f6ccaade3b906c96cb39c1276ad661c76b6ff485eedba549db40',
};

const INVALID_SIGNATURE = {
  publicKey: 'C676E0B88E6BD90CC975D0B8AF47D898F34336F393027B8F9474B2B26D771D11',
  signature:
    '9780185E577109A8BAC8F45F98DA491A97A31E9806647B64D2085D6BE07EA5AA6E9CD21BB43699763861423BA9405771FD95E6373C8807CC69D318C3E61E6307',
};

describe('verifySignature function', () => {
  it('should verify a valid ED25519 signature correctly', () => {
    expect(
      verifySignature(ED25519.publicKey, TEST_MESSAGE, ED25519.signature),
    ).toBe(true);
  });

  it('should verify a valid ECDSA secp256k1 signature correctly', () => {
    expect(
      verifySignature(
        ECDSA_SECP256K1.publicKey,
        TEST_MESSAGE,
        ECDSA_SECP256K1.signature,
      ),
    ).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    expect(
      verifySignature(
        INVALID_SIGNATURE.publicKey,
        INVALID_MESSAGE,
        INVALID_SIGNATURE.signature,
      ),
    ).toBe(false);
  });
});
