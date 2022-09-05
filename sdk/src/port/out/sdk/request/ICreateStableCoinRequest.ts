import Account from '../../../../domain/context/Hedera/Account/Account.js';

export interface ICreateStableCoinRequest {
	account: Account;
	name: string;
	symbol: string;
	decimals: number;
}
