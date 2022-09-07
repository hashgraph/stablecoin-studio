import BaseEntity from '../../BaseEntity.js';
import { AccountId } from './AccountId.js';

export default class Account extends BaseEntity {
	private _accountId: AccountId;
	public get accountId(): AccountId {
		return this._accountId;
	}
	public set accountId(value: AccountId) {
		this._accountId = value;
	}
	private _privateKey: string;
	public get privateKey(): string {
		return this._privateKey;
	}
	public set privateKey(value: string) {
		this._privateKey = value;
	}

	constructor(accountId: AccountId, privateKey: string) {
		super();
		this.accountId = accountId;
		this.privateKey = privateKey;
	}

	public getAccountId(): string {
		return this.accountId.id;
	}
}
