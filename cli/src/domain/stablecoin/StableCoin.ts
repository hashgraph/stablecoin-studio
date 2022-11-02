import { AccountId, PublicKey } from 'hedera-stable-coin-sdk';

export interface StableCoin {
  name: string;
  symbol: string;
  autoRenewAccount: string;
  decimals: number;
  initialSupply?: string;
  supplyType?: string;
  maxSupply?: string;
  KYCKey?: PublicKey;
  wipeKey?: PublicKey;
  adminKey?: PublicKey;
  freezeKey?: PublicKey;
  pauseKey?: PublicKey;
  supplyKey?: PublicKey;
  treasury?: AccountId;
  id?: string;
  memo?: string;
}
