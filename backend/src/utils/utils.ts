import * as nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';
import * as elliptic from 'elliptic';
import { hexRegex } from '../common/Regexp';

export function verifySignature(
  publicKeyHex: string,
  message: string,
  signatureHex: string,
): boolean {
  try {
    const publicKeyBytes = hexToUint8Array(publicKeyHex);
    const signatureBytes = hexToUint8Array(signatureHex);
    const messageBytes = decodeUTF8(message);

    if (
      nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    ) {
      return true;
    }
  } catch (error) {
    console.log('Error verifying ED25519 signature:', error);
  }

  try {
    const ec = new elliptic.ec('secp256k1');
    const keyECDSA = ec.keyFromPublic(publicKeyHex, 'hex');
    const messageHash = ec.hash().update(decodeUTF8(message)).digest();

    return keyECDSA.verify(messageHash, signatureHex);
  } catch (error) {
    console.log('Error verifying ECDSA secp256k1 signature:', error);
    return false;
  }
}

function hexToUint8Array(hexString: string): Uint8Array {
  if (!hexRegex.test(hexString)) {
    throw new Error('Invalid hex string');
  }
  return new Uint8Array(
    hexString.match(/[\da-f]{2}/gi).map((byte) => parseInt(byte, 16)),
  );
}
