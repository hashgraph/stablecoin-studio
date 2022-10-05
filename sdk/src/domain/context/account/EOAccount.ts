import { NetworkMode } from '../../../port/in/sdk/sdk.js';
import Account from './Account.js';
import PrivateKey from './PrivateKey.js';

export default class EOAccount extends Account {

	public privateKey: PrivateKey;

	constructor(accountId: string, privateKey: PrivateKey) {
		super(accountId, NetworkMode.EOA, privateKey);
	}
}
