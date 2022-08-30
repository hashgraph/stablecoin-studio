export interface StableCoinList {
  id: string;
  symbol: string;
}

export interface StableCoinDetail {
  tokenId?: string;
  name?: string;
  symbol?: string;
  decimals?: string;
  totalSupply?: string;
  maxSupply?: string;
  customFee?: ICustomFees;
  treasuryId?: string;
  expirationTime?: string;
  memo?: string;
  paused?: string;
  freeze?: boolean;
  // kycStatus: string;
  deleted?: boolean;
  adminKey?: IAdminKey;
  kycKey?: IKYCKey;
  freezeKey?: IFreezeKey;
  wipeKey?: IWipeKey;
  supplyKey?: string;
  pauseKey?: string;
}

export interface ICustomFees {
  created_timestamp: string;
  fixed_fees: string[];
  fractional_fees: string[];
}

export interface IAdminKey {
  _type: string;
  key: string;
}

export interface IKYCKey {
  _type: string;
  key: string;
}

export interface IFreezeKey {
  _type: string;
  key: string;
}

export interface IWipeKey {
  _type: string;
  key: string;
}
