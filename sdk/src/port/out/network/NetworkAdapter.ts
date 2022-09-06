import { HederaNetwork } from '../../../core/enum.js';
import HashPackProvider from '../../in/hedera/hashconnect/HashPackProvider.js';
import HethersProvider from '../../in/hedera/hethers/HethersProvider.js';
import { IProvider, IniConfigOptions } from '../../in/hedera/Provider.js';
import { Account, AppMetadata, NetworkMode } from '../../../sdk.js';

type NetworkClientOptions = HederaClientOptions;

type HederaClientOptions = {
	account?: Account;
	appMetadata?: AppMetadata;
};

export default class NetworkAdapter {
	private mode: NetworkMode;
	private network: HederaNetwork;
	private options: NetworkClientOptions;
	private provider: IProvider;

	constructor(
		mode: NetworkMode,
		network: HederaNetwork,
		options: NetworkClientOptions,
	) {
		this.mode = mode;
		this.network = network;
		this.options = options;
	}

	/**
	 * Init
	 */
	public async init(): Promise<NetworkAdapter> {
		switch (this.mode) {
			case NetworkMode.EOA:
				this.provider = await this.getHethersProvider(this.network);
				return this;
			case NetworkMode.HASHPACK:
				// this.provider = await this.getHashpackProvider(
				// 	this.network,
				// 	this.options,
				// );
				// return this;
				throw new Error('Not supported');
			default:
				throw new Error('Not supported');
		}
	}

	public async stop(): Promise<boolean> {
		return this.provider.stop();
	}

	// private getHashpackProvider(
	// 	network: HederaNetwork,
	// 	options: IniConfigOptions,
	// ): Promise<HashPackProvider> {
	// 	return new HashPackProvider().init({ network, options });
	// }

	private getHethersProvider(
		network: HederaNetwork,
	): Promise<HethersProvider> {
		return new HethersProvider().init({ network });
	}

}
