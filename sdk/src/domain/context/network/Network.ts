export type Environment =
	| 'testnet'
	| 'previewnet'
	| 'mainnet'
	| 'local'
	| string;

export default class Network {
	constructor(
		public environment: Environment,
		public mirrorNode?: string,
		public rpcNode?: string,
		public consensusNodes?: string,
	) {}
}
