import { Environment } from '../network/Network.js';
import PrivateKey from './PrivateKey.js';
import PublicKey from './PublicKey.js';

export default class Account {
	constructor(
		public id: string,
		public environment: Environment,
		public privateKey?: PrivateKey,
		public publicKey?: PublicKey,
		public evmAddress?: string,
	) {}
}
