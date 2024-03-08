import { verifySignature } from '../../src/utils/utils';

describe('verifySignature function', () => {
  it('should verify a valid ED25519 signature correctly', () => {
    const publicKeyED25519 =
      '0xAD5E03AA390B5B804A03B07F492EA6C00650ABDC11D13A9988242E34F59A0668';
    const message = 'message';
    const signatureED25519 =
      '0x6FE522F8E1459B270042A91233BAA721731D329229916EDCE12CEB130A65DFF071C0C4794BED6EFD43F1586CAEBA058C18D0A8D1FFE3766E8E91A31ABD86E30C';

    expect(verifySignature(publicKeyED25519, message, signatureED25519)).toBe(
      true,
    );
  });

  it('should verify a valid ECDSA signature correctly', () => {
    const publicKeyECDSA = 'key';
    const message = 'message';
    const signatureECDSA = 'signature';

    expect(verifySignature(publicKeyECDSA, message, signatureECDSA)).toBe(true);
  });

  it('should return false for an invalid signature', () => {
    const publicKey =
      '0xC676E0B88E6BD90CC975D0B8AF47D898F34336F393027B8F9474B2B26D771D11';
    const message = 'invalid';
    const signature =
      '0x9780185E577109A8BAC8F45F98DA491A97A31E9806647B64D2085D6BE07EA5AA6E9CD21BB43699763861423BA9405771FD95E6373C8807CC69D318C3E61E6307';
    expect(verifySignature(publicKey, message, signature)).toBe(false);
  });
});
