import Account from '../account/Account.js';
import { Capability } from './Capability.js';
import {StableCoin} from './StableCoin.js';

export default class StableCoinCapabilities {
	constructor(
		public readonly coin: StableCoin,
		public readonly capabilities: Capability[] = [],
		public readonly account: Account,
	) {}
}
