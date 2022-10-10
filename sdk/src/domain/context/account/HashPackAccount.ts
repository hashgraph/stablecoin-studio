import { NetworkMode } from '../../../port/in/sdk/sdk.js';
import Account from './Account.js';

export default class HashPackAccount extends Account {
	constructor(accountId: string) {
		super(accountId);
	}
}
