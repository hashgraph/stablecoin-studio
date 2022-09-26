import { AccountId, PublicKey } from 'hedera-stable-coin-sdk';


export interface StableCoin {
  name: string;
  symbol: string;
  autoRenewAccount: string;
  decimals: number;
  initialSupply?: bigint;
  supplyType?: string;
  maxSupply?: bigint;
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
