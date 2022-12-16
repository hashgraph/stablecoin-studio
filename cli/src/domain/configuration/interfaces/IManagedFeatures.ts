import { RequestPublicKey } from 'hedera-stable-coin-sdk';

export interface IManagedFeatures {
  adminKey: RequestPublicKey;
  supplyKey: RequestPublicKey;
  //KYCKey: PublicKey;
  freezeKey: RequestPublicKey;
  wipeKey: RequestPublicKey;
  pauseKey: RequestPublicKey;
}
