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

import * as nacl from 'tweetnacl';
import * as elliptic from 'elliptic';
import { getBytes, sha256 } from 'ethers';

export function verifySignature(
  publicKeyHex: string,
  messageHex: string,
  signatureHex: string,
): boolean {
  try {
    const publicKeyBytes = hexToUint8Array(publicKeyHex);
    const signatureBytes = hexToUint8Array(signatureHex);
    const messageBytes = hexToUint8Array(messageHex);

    if (
      nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    ) {
      return true;
    }
  } catch (error) {
    // console.log('Error verifying ED25519 signature:', error);
  }

  try {
    const ec = new elliptic.ec('secp256k1');
    const keyECDSA = ec.keyFromPublic(publicKeyHex, 'hex');

    const messageBytes = hexToUint8Array(messageHex);
    const messageHashHex = sha256(messageBytes);
    const messageHashBytes = getBytes(messageHashHex);

    const signature = {
      r: signatureHex.slice(0, 64),
      s: signatureHex.slice(64, 128),
    };

    return keyECDSA.verify(messageHashBytes, signature);
  } catch (error) {
    // console.error('Error verifying ECDSA secp256k1 signature:', error);
    return false;
  }
}

function hexToUint8Array(hexString: string): Uint8Array {
  const cleanHexString = hexString.replace(/^0x/i, '');

  if (!cleanHexString.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('Invalid hex string');
  }

  return new Uint8Array(
    cleanHexString.match(/[\da-fA-F]{2}/g).map((byte) => parseInt(byte, 16)),
  );
}
