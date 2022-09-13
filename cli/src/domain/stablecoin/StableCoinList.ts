import { ContractId } from "hedera-stable-coin-sdk";

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
  kycKey?: ContractId | IPublicKey;
  freezeKey?: ContractId | IPublicKey;
  wipeKey?: ContractId | IPublicKey;
  supplyKey?: ContractId | IPublicKey;
  pauseKey?: ContractId | IPublicKey;
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
