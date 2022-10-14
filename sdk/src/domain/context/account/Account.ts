import AccountId from './AccountId.js';
import PrivateKey from './PrivateKey.js';
import BaseEntity from '../../BaseEntity.js';

export default class Account extends BaseEntity {
	public accountId: AccountId;
	public privateKey?: PrivateKey;
	public evmAddress?: string

	constructor(
		accountId: string,
		privateKey?: PrivateKey,
		evmAddress?: string
	) {
		super();
		this.accountId = new AccountId(accountId);
		this.privateKey = privateKey;
		this.evmAddress = evmAddress;
	}
}
