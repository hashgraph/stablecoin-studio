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
  '0aef022aec020a350a1a0a0c0892d5c0af0610efaedd950312080800100018c3bf0c180012080800100018c3bf0c1880c2d72f22020878320072020a0012b2020a640a20cf8c984270cd7cd25e1bd6df1a3a22ee2d1cd53a0f7bbfdf917a8bd881b11b5e1a40e120be5fa7fa085c989e69b60b6f80218d8a49751abc84456bc8bd88ba3766101b658d45ebd7e0b742382e9bd8ad98a88f03a9d6118cad42da275531e068a50b0a640a20c539f0f94cd937b721f9bd4c0b965164622798cf8ddea6169d2cb734f70baf8e1a406cf580daa232d279badbd1bc1227531d4c98ab444a2a7ec1851af17400e01c805bf96223ad2cd7a4469f3709c0fb35b77cb217543e4741d8db92175de583cc000a640a200e3c05cf1c2a04db21d0e73f0e608d80d7043851154a4d9516e6b0ee929f7f9f1a40ff79cb99db2d5001835b7ed3c26fa8a980ee541b9a1fb1c3972a6a62dfce1bd05372fed331ee1d672dc41df5ec1c12a38104962d2fb6a80dbf12286375f59c0f';

const ED25519 = {
  publicKey: 'DA75DEC238BC5F3F555B0E3D423F8965926805A4949E066CD8129F5C6D5C45F9',
  signature:
    '26AB790CF9DA74A81782D6BA4C1BDE0CB5AC529DAF8363A832D62B92593009B58C93394B1619AF5AEA8F9268F16E8BCD9F8855A852D2F8F58D21875FE17D0302',
};

const HEX_TEST_MESSAGE_2 = '0a512a4f0a4b0a1b0a0c08a6a385b00610b587e5a60212090800100018dda2e401180012060800100018031880cab5ee01220308b4013200c202160a090800100018dda2e40112090800100018fda2e5011200'

const ECDSA_SECP256K1 = {
  publicKey:
    '024d7906cba70ad272e93b94f2bbd4276b55cb3172403013973071163a6b7656a0',
  signature:
    'a8d5fff76455e40a0bf7d0b821849829c54e24c75f4498178ade1aa37a05f88edb911a37a9654a73e2db045c62e3b77fa450a39816de0cd481b721ee7cdc95e7',
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
        HEX_TEST_MESSAGE_2,
        ECDSA_SECP256K1.signature,
      ),
    ).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    expect(
      verifySignature(
        INVALID_SIGNATURE.publicKey,
        HEX_TEST_MESSAGE,
        INVALID_SIGNATURE.signature,
      ),
    ).toBe(false);
  });
});
