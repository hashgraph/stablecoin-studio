import { AccountId } from '@hashgraph/sdk';

export enum HederaNetworkEnviroment {
	MAIN = 'mainnet',
	PREVIEW = 'previewnet',
	TEST = 'testnet',
	LOCAL = 'local',
}
export enum StableCoinRole {
	SUPPLIER_ROLE = '0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60',
	WIPE_ROLE = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
	ADMIN_SUPPLIER_ROLE = '0x8dd0f644b9b923c24aa7291efd0bd4141a413ec8cdb492e43928e281ce1a38e9',
	RESCUE_ROLE = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
	PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
}
export class HederaNetwork {
	hederaNetworkEnviroment: HederaNetworkEnviroment;
	nodes: { [key: string]: string | AccountId } | undefined;
	mirrorNodeUrl: unknown;
	constructor(
		hederaNetworkEnviroment: HederaNetworkEnviroment,
		nodes?: { [key: string]: string | AccountId },
		mirrorNodeUrl?: string,
	) {
		this.hederaNetworkEnviroment = hederaNetworkEnviroment;
		this.nodes = nodes;
		this.mirrorNodeUrl = mirrorNodeUrl;
	}
}
export interface HederaNetworkSpec {
	name: string;
	consensusNodes: { [key: string]: string | AccountId } | undefined;
	mirrorNodeUrl: unknown;
}
export function getHederaNetwork(
	hederaNetwork: HederaNetwork,
): HederaNetworkSpec {
	const enviroment: HederaNetworkEnviroment =
		hederaNetwork?.hederaNetworkEnviroment;
	const nodes: { [key: string]: string | AccountId } | undefined = hederaNetwork?.nodes;
	const mirrorNodeUrl: unknown = hederaNetwork?.mirrorNodeUrl;
	switch (enviroment) {
		case HederaNetworkEnviroment.MAIN:
			return {
				name: 'mainnet',
				consensusNodes: nodes,
				mirrorNodeUrl: mirrorNodeUrl
					? mirrorNodeUrl
					: 'https://mainnet.mirrornode.hedera.com',
			};
		case HederaNetworkEnviroment.PREVIEW:
			return {
				name: 'previewnet',
				consensusNodes: nodes,
				mirrorNodeUrl: mirrorNodeUrl
					? mirrorNodeUrl
					: 'https://previewnet.mirrornode.hedera.com',
			};
		case HederaNetworkEnviroment.TEST:
			return {
				name: 'testnet',
				consensusNodes: nodes,
				mirrorNodeUrl: mirrorNodeUrl
					? mirrorNodeUrl
					: 'https://testnet.mirrornode.hedera.com',
			};
		case HederaNetworkEnviroment.LOCAL:
			return {
				name: 'local',
				consensusNodes: { '127.0.0.1:50211': '0.0.3' },
				mirrorNodeUrl: mirrorNodeUrl
					? mirrorNodeUrl
					: 'http://127.0.0.1:5551',
			};
	}
}
