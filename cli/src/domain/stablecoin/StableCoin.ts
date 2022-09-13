export interface StableCoin {
  name: string;
  symbol: string;
  autoRenewAccount: string;
  decimals: number;
  initialSupply?: bigint;
  supplyType?: string;
  maxSupply?: bigint;
  KYCKey?: string;
  wipeKey?: string;
  adminKey?: string;
  freezeKey?: string;
  pauseKey?: string;
  supplyKey?: string;
  treasury?: string;
  id?: string;
  memo?: string;
}
