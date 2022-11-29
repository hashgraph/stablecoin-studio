import { Environment } from '../network/Network.js';

export type Key = {
	key: string;
	type: string;
};

export default class Account {
	constructor(
		public id: string,
		public environment: Environment,
		public privateKey?: Key,
		public publicKey?: Key,
		public evmAddress?: string,
	) {}
}
