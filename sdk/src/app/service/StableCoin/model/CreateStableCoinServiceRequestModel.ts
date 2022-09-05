import Account from '../../../../domain/context/hedera/account/Account.js';

export default class CreateStableCoinServiceRequestModel {
	public account: Account;
	public name: string;
	public symbol: string;
	public decimals: number;
}
