import { AccountId, NetworkMode, PrivateKey } from '../../../port/in/sdk/sdk.js';
import BaseEntity from '../../BaseEntity.js';
import { AccountNotValid } from './error/AccountNotValid.js';

export default class Account extends BaseEntity {
	public accountId: AccountId;
	public networkMode: NetworkMode;
	public privateKey?: PrivateKey;

	constructor(
		accountId: AccountId,
		networkMode: NetworkMode,
		privateKey?: PrivateKey,
	) {
		super();
		this.accountId = accountId;
		this.networkMode = networkMode;
		this.privateKey = privateKey;
		this.validateAccount();
	}

	public static validateAccount(acct: Account): boolean {
		return acct.networkMode === NetworkMode.EOA && !!acct.privateKey;
	}
	
    private validateAccount(): void {
		if(!Account.validateAccount(this)){
            throw new AccountNotValid('Invalid Network Mode: EOA without private key');
        }
	}
}
