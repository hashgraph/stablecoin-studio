import BaseEntity from '../../BaseEntity.js';
import { AccountId } from './AccountId.js';
import { PrivateKey } from './PrivateKey.js';

export default class Account extends BaseEntity {
	private _accountId: AccountId;
	public get accountId(): AccountId {
		return this._accountId;
	}
	public set accountId(value: AccountId) {
		this._accountId = value;
	}
	private _privateKey: PrivateKey;
	public get privateKey(): PrivateKey {
		return this._privateKey;
	}
	public set privateKey(value: PrivateKey) {
		this._privateKey = value;
	}

	constructor(accountId: AccountId, privateKey: PrivateKey) {
		super();
		this.accountId = accountId;
		this.privateKey = privateKey;
	}

	public getAccountId(): string {
		return this.accountId.id;
	}
	
	public getPrivateKey(): string {
		return this.privateKey.key;
	}
}
