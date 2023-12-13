export function hexStringToUint8Array(hexString: string): Uint8Array {
  const uint8Array = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    const byte = parseInt(hexString.substr(i, 2), 16);
    uint8Array[i / 2] = byte;
  }
  return uint8Array;
}
