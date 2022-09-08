export interface StableCoin {
  name: string;
  symbol: string;
  autoRenewAccountId: string;
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
  treasuryAccountAddress?: string;
}
