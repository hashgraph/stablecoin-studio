import { NetworkMode } from '../../../port/in/sdk/sdk.js';
import Account from './Account.js';
import AccountId from './AccountId.js';

export default class HashPackAccount extends Account {

	constructor(accountId: AccountId) {
		super(accountId, NetworkMode.HASHPACK);
	}
}
