import { PublicKey } from 'hedera-stable-coin-sdk';

export interface IManagedFeatures {
  adminKey: PublicKey;
  supplyKey: PublicKey;
  //KYCKey: PublicKey;
  freezeKey: PublicKey;
  wipeKey: PublicKey;
  pauseKey: PublicKey;
  treasuryId: string;
}
