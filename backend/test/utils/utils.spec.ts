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

const HEX_TEST_MESSAGE =
  '0a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a00';
const HEX_INVALID_MESSAGE = 'invalid';

const ED25519 = {
  publicKey: 'DA75DEC238BC5F3F555B0E3D423F8965926805A4949E066CD8129F5C6D5C45F9',
  signature:
    '26AB790CF9DA74A81782D6BA4C1BDE0CB5AC529DAF8363A832D62B92593009B58C93394B1619AF5AEA8F9268F16E8BCD9F8855A852D2F8F58D21875FE17D0302',
};

const ECDSA_SECP256K1 = {
  publicKey:
    '04e78e67a00f51af1753241028d6badd9c3974cd4c4f07e64be55cecbf8cc0d7784a8b8d8d406b193c24ef4ff644a2281987b6a3897f01ae2637b1d02a1621ed6e',
  signature:
    '2174f2d786b9d41b8958a0b507c9f80e09b2e6bff51bd458e920658c2105d24a9db301089ba0e23ac8b88e9e4c93b8bc970e7f809f3ad4ff063c51482b098868',
};

const INVALID_SIGNATURE = {
  publicKey: 'C676E0B88E6BD90CC975D0B8AF47D898F34336F393027B8F9474B2B26D771D11',
  signature:
    '3044022003402794e20db98496d2ed4735c2ff9cac11b69ae0c4dc14644c0e5271a4a14b02203fa0152c3d5b1904ee804eef4a76bdb0471bd73a0c131448c4eab1184bed1cbc',
};

describe('verifySignature function', () => {
  it('should verify a valid ED25519 signature correctly', () => {
    expect(
      verifySignature(ED25519.publicKey, HEX_TEST_MESSAGE, ED25519.signature),
    ).toBe(true);
  });

  it('should verify a valid ECDSA secp256k1 signature correctly', () => {
    expect(
      verifySignature(
        ECDSA_SECP256K1.publicKey,
        HEX_TEST_MESSAGE,
        ECDSA_SECP256K1.signature,
      ),
    ).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    expect(
      verifySignature(
        INVALID_SIGNATURE.publicKey,
        HEX_INVALID_MESSAGE,
        INVALID_SIGNATURE.signature,
      ),
    ).toBe(false);
  });
});
