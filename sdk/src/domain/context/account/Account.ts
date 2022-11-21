import BaseEntity from '../../BaseEntity.js';
import AccountId from './AccountId.js';
import PrivateKey from './PrivateKey.js';
import PublicKey from './PublicKey.js';

export default class Account extends BaseEntity {
	public accountId: AccountId;
	public privateKey?: PrivateKey;
	public evmAddress?: string;
	public publicKey?: PublicKey;

	constructor(
		accountId: string,
		privateKey?: PrivateKey,
		evmAddress?: string,
		publicKey?: PublicKey,
	) {
		super();
		this.accountId = new AccountId(accountId);
		this.privateKey = privateKey;
		this.evmAddress = evmAddress;
		this.publicKey = publicKey;
	}
}
