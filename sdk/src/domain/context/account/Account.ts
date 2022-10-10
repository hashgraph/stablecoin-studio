import {
	AccountId,
	PrivateKey,
} from '../../../port/in/sdk/sdk.js';
import BaseEntity from '../../BaseEntity.js';

export default class Account extends BaseEntity {
	public accountId: AccountId;
	public privateKey?: PrivateKey;

	constructor(
		accountId: string,
		privateKey?: PrivateKey,
	) {
		super();
		this.accountId = new AccountId(accountId);
		this.privateKey = privateKey;
	}
}
