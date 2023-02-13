import { RequestPublicKey } from '@hashgraph-dev/stablecoin-npm-sdk';

export interface IManagedFeatures {
  adminKey: RequestPublicKey;
  supplyKey: RequestPublicKey;
  KYCKey: RequestPublicKey;
  freezeKey: RequestPublicKey;
  wipeKey: RequestPublicKey;
  pauseKey: RequestPublicKey;
  feeScheduleKey: RequestPublicKey;
  grantKYCToOriginalSender: boolean;
}
