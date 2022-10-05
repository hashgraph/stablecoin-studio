import AccountId from '../../../../domain/context/account/AccountId.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';
import { Account } from '../sdk.js';

export interface ICreateStableCoinRequest {
	account: Account;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: string;
	adminKey?: PublicKey;
	freezeKey?: PublicKey;
	KYCKey?: PublicKey;
	wipeKey?: PublicKey;
	pauseKey?: PublicKey;
	supplyKey?: PublicKey;
	treasury?: AccountId;
}
