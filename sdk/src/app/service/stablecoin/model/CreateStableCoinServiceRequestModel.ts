import Account from '../../../../domain/context/account/Account.js';

export default class CreateStableCoinServiceRequestModel {
	public account: Account;
	public name: string;
	public symbol: string;
	public decimals: number;
	public initialSupply?: bigint;
	public maxSupply?: bigint;
	public memo?: string;
	public freeze?: string;
	public freezeDefault?: boolean;
}
