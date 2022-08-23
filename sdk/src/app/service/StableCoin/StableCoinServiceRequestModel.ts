import { Account } from '../../../sdk.js';

export default class StableCoinServiceRequestModel {
	public account: Account;
	public name: string;
	public symbol: string;
	public decimals: number;
}
