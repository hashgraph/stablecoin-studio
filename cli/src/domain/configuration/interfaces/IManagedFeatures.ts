import { RequestPublicKey } from 'hedera-stable-coin-sdk';

export interface IManagedFeatures {
  adminKey?: RequestPublicKey;
  supplyKey?: RequestPublicKey;
  freezeKey?: RequestPublicKey;
  wipeKey?: RequestPublicKey;
  pauseKey?: RequestPublicKey;
  kycKey?: RequestPublicKey;
  feeScheduleKey?: RequestPublicKey;
}
