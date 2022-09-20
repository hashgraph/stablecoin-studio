/* eslint-disable no-use-before-define */
import {
	AppMetadata,
	HederaNetwork,
	HederaNetworkEnviroment,
	NetworkMode,
	SDK,
} from 'hedera-stable-coin-sdk';

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

	public static async getInstance() {
		if (!SDKService.instance)
			SDKService.instance = new SDK({
				network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
				mode: NetworkMode.HASHPACK,
				options: {
					appMetadata,
				},
			});
		await SDKService.instance.init();

		return SDKService.instance;
	}

	public static async connectWallet() {
		await SDKService.getInstance().then((instance) => instance.connectWallet());
	}

	public static async getStatus(): Promise<HashConnectConnectionState> {
		return await SDKService.getInstance().then((instance) =>
			instance.gethashConnectConectionStatus(),
		);
	}

	// extension(): boolean {
	// 	return this.sdk.getAvailabilityExtension();
	// }

	// cashIn(): void {
	// 	this.sdk.cashIn({});
	// }
}

export default SDKService;
