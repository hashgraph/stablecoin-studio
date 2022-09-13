import BaseEntity from '../../BaseEntity.js';
import AccountId from './AccountId.js';
import PrivateKey from './PrivateKey.js';

export default class EOAccount extends BaseEntity {
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

	constructor(params: { accountId: AccountId; privateKey: PrivateKey }) {
		const { accountId, privateKey } = params;
		super();
		this._accountId = accountId;
		this._privateKey = privateKey;
	}
}
