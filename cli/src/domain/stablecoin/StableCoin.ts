export interface StableCoin {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply?: number;
  supplyType?: string;
  totalSupply?: number;
  expirationTime?: number;
  memo?: string;
  freeze?: boolean;
  KYC?: string;
  wipe?: string;
  feeSchedule?: string;
  admin?: string;
}
