export interface StableCoinList {
  id: string;
  symbol: string;
}

export interface StableCoinDetail {
  tokenId?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: bigint;
  maxSupply?: bigint;
  customFee?: ICustomFees;
  treasuryId?: string;
  expirationTime?: string;
  memo?: string;
  paused?: string;
  freezeDefault?: boolean;
  // kycStatus: string;
  deleted?: boolean;
  adminKey?: IPublicKey;
  kycKey?: IPublicKey;
  freezeKey?: IPublicKey;
  wipeKey?: IPublicKey;
  supplyKey?: IPublicKey;
  pauseKey?: IPublicKey;
}

export interface ICustomFees {
  created_timestamp: string;
  fixed_fees: string[];
  fractional_fees: string[];
}

export interface IPublicKey {
  type: string;
  key: string;
}
