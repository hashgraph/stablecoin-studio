import Contract from '../contract/Contract.js';

export default class StableCoin {
	constructor(
		public proxy: Contract,
		public tokenId: string,
		public evmAddress: string,
	) {}
}
