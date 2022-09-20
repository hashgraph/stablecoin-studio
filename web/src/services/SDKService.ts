import {
	AppMetadata,
	HederaNetwork,
	HederaNetworkEnviroment,
	NetworkMode,
	SDK,
} from 'hedera-stable-coin-sdk';
import { HashConnectConnectionState } from '../context/SDKContext';

const appMetadata: AppMetadata = {
	name: 'dApp Example',
	description: 'An example hedera dApp',
	icon: 'https://absolute.url/to/icon.png',
	url: '',
};

class SDKService {
	private sdk: SDK;

	constructor() {
		this.sdk = new SDK({
			network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
			mode: NetworkMode.HASHPACK,
			options: {
				appMetadata,
			},
		});
	}

	getSDK() {
		return this.sdk;
	}

	init() {
		this.sdk.init();
	}

	connectWallet() {
		this.sdk.connectWallet();
	}

	status(): HashConnectConnectionState {
		return this.sdk.gethashConnectConectionStatus();
	}

	extension(): boolean {
		return this.sdk.getAvailabilityExtension();
	}

	// cashIn(): void {
	// 	this.sdk.cashIn({

	//   });
	// }
}

const sdk = new SDKService();
sdk.init();
console.log('INIT SERVICE');

export default sdk;
