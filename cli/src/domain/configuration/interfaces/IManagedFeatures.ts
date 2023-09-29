import { RequestPublicKey } from '@hashgraph/stablecoin-npm-sdk';

export interface IManagedFeatures {
  name?: string;
  symbol?: string;
  adminKey?: RequestPublicKey;
  supplyKey?: RequestPublicKey;
  freezeKey?: RequestPublicKey;
  wipeKey?: RequestPublicKey;
  pauseKey?: RequestPublicKey;
  kycKey?: RequestPublicKey;
  feeScheduleKey?: RequestPublicKey;
}
