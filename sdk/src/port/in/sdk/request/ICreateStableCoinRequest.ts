import AccountId from '../../../../domain/context/account/AccountId.js';
import PrivateKey from '../../../../domain/context/account/PrivateKey.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';

export interface ICreateStableCoinRequest {
	accountId: AccountId;
	privateKey: PrivateKey;
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
