export interface StableCoin {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply?: bigint;
  supplyType?: string;
  maxSupply?: bigint;
  expirationTime?: number;
  memo?: string;
  freezeDefault?: boolean;
  KYC?: string;
  wipe?: string;
  feeSchedule?: string;
  admin?: string;
}
