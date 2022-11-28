import Account from './Account.js';
import PrivateKey from './PrivateKey.js';
import { AccountNotValid } from './error/AccountNotValid.js';

export default class EOAccount extends Account {

	public privateKey: PrivateKey;

	constructor(accountId: string, privateKey: PrivateKey, evmAddress?: string) {
		super(accountId, privateKey, evmAddress);
		this.validateAccount();
	}

	private validateAccount(): void {
		if (!this.privateKey) {
			throw new AccountNotValid(
				'Invalid Network Mode: EOA without private key',
			);
		}
	}
}
