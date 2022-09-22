import { HederaNetwork, HederaNetworkEnviroment, NetworkMode, SDK } from 'hedera-stable-coin-sdk';

import type { AppMetadata, InitializationData } from 'hedera-stable-coin-sdk';

export enum HashConnectConnectionState {
	Connected = 'Connected',
	Disconnected = 'Disconnected',
	Paired = 'Paired',
	Connecting = 'Connecting',
}

const appMetadata: AppMetadata = {
	name: 'dApp Example',
	description: 'An example hedera dApp',
	icon: 'https://absolute.url/to/icon.png',
	url: '',
};

export class SDKService {
	private static instance: SDK | undefined;

	constructor() {}

	public static getInstance() {
		if (!SDKService.instance) {
			SDKService.instance = new SDK({
				network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
				mode: NetworkMode.HASHPACK,
				options: {
					appMetadata,
				},
			});
		}

		return SDKService.instance;
	}

	public static async initSdk(onInit: (data: InitializationData) => void) {
		return await this.getInstance().init({ onInit });
	}

	public static isInit() {
		// @ts-ignore
		return !!this.instance?.networkAdapter?._provider;
	}

	public static connectWallet() {
		SDKService.getInstance().connectWallet();
	}

	public static async getAvailabilityExtension(): Promise<boolean> {
		return SDKService.getInstance().getAvailabilityExtension();
	}

	public static async getStatus(): Promise<HashConnectConnectionState | undefined> {
		return SDKService.getInstance().gethashConnectConectionStatus();
	}
}

export default SDKService;
