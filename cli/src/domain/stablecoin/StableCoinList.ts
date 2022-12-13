
export interface StableCoinList {
  id: string;
  symbol: string;
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
