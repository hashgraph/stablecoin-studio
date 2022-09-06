import Account from "../../../../domain/context/account/Account.js";

export default class CashInStableCoinServiceRequestModel {
	public treasuryId: string;
	public account: Account;
	public amount: number;
}
