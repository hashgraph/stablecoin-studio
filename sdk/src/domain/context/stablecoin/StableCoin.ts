import Contract from '../contract/Contract.js';

export default class StableCoin {
	constructor(
		public proxy: Contract,
		public evmProxyAddress: string,
		public tokenId: string, // ... rest
	) {}
}
