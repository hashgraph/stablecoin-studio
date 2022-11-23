import { AccountId } from '@hashgraph/sdk';

export enum HederaNetworkEnviroment {
	MAIN = 'mainnet',
	PREVIEW = 'previewnet',
	TEST = 'testnet',
	LOCAL = 'local',
}
export enum StableCoinRole {
	CASHIN_ROLE = '0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c',
	BURN_ROLE = '0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22',
	WIPE_ROLE = '0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3',
	RESCUE_ROLE = '0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a',
	PAUSE_ROLE = '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d',
	FREEZE_ROLE = '0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d',
	DELETE_ROLE = '0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2',
	DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000',
	WITHOUT_ROLE = '0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc',
}

export enum PrivateKeyType {
	ECDSA = 'ECDSA',
	ED25519 = 'ED25519',
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
	const nodes: { [key: string]: string | AccountId } | undefined =
		hederaNetwork?.nodes;
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
