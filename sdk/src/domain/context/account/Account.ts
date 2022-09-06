import BaseEntity from '../../BaseEntity.js';

export default class Account extends BaseEntity {
	private _accountId: string;
	public get accountId(): string {
		return this._accountId;
	}
	public set accountId(value: string) {
		this._accountId = value;
	}
	private _privateKey: string;
	public get privateKey(): string {
		return this._privateKey;
	}
	public set privateKey(value: string) {
		this._privateKey = value;
	}

	constructor(accountId: string, privateKey: string) {
		super();
		this.accountId = accountId;
		this.privateKey = privateKey;
	}
}
