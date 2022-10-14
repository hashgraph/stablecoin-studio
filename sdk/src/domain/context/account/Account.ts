import BaseEntity from '../../BaseEntity.js';
import AccountId from './AccountId.js';
import PrivateKey from './PrivateKey.js';

export default class Account extends BaseEntity {
	public accountId: AccountId;
	public privateKey?: PrivateKey;

	constructor(accountId: string, privateKey?: PrivateKey) {
		super();
		this.accountId = new AccountId(accountId);
		this.privateKey = privateKey;
	}
}
