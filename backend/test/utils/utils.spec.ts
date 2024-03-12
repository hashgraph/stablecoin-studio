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

describe('verifySignature function', () => {
  it('should verify a valid ED25519 signature correctly', () => {
    const publicKeyED25519 =
      '9BA43FAF1EA9758FFCC8D9709E99D90D4397608DC385359EC9048AAE98BF5596';
    const message = 'message';
    const signatureED25519 =
      '69963B9639CDD14D6FB9387DA22169A6CDE44E4CB3A83F5F01EF5CECFCBBED44076FA296DCE477D2260DF8A726D908EA916A1351999BA03F666B82E0F15C7C03';

    expect(verifySignature(publicKeyED25519, message, signatureED25519)).toBe(
      true,
    );
  });

  it('should verify a valid ECDSA secp256k1 signature correctly', () => {
    const publicKeyECDSA =
      '04904ecfa9307a605dd4028deab1d9aae9a63d7a33f6cb2a582b87c94b78d3b859f49dfb90bf5b2c1b185063dfad7ed46ade79ee0fd9c85f9d53b78eba6f2f9e47';
    const message = 'message';
    const signatureECDSA =
      '30450221008259eed64047793b50e2c8770768ae46d10b6a8ab3db0c4c994d4021e8e7d1cc02206f9029228999f6ccaade3b906c96cb39c1276ad661c76b6ff485eedba549db40';

    expect(verifySignature(publicKeyECDSA, message, signatureECDSA)).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    const publicKey =
      'C676E0B88E6BD90CC975D0B8AF47D898F34336F393027B8F9474B2B26D771D11';
    const message = 'invalid';
    const signature =
      '9780185E577109A8BAC8F45F98DA491A97A31E9806647B64D2085D6BE07EA5AA6E9CD21BB43699763861423BA9405771FD95E6373C8807CC69D318C3E61E6307';
    expect(verifySignature(publicKey, message, signature)).toBe(false);
  });
});
