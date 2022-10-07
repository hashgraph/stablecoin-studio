import {
	AccountId,
	NetworkMode,
	PrivateKey,
} from '../../../port/in/sdk/sdk.js';
import BaseEntity from '../../BaseEntity.js';
import { AccountNotValid } from './error/AccountNotValid.js';

export default abstract class Account extends BaseEntity {
	public accountId: AccountId;
	public networkMode: NetworkMode;
	public privateKey?: PrivateKey;

	constructor(
		accountId: string,
		networkMode: NetworkMode,
		privateKey?: PrivateKey,
	) {
		super();
		this.accountId = new AccountId(accountId);
		this.networkMode = networkMode;
		this.privateKey = privateKey;
		this.validateAccount();
	}

	private validateAccount(): void {
		if (this.networkMode === NetworkMode.EOA && !this.privateKey) {
			throw new AccountNotValid(
				'Invalid Network Mode: EOA without private key',
			);
		}
	}
}
