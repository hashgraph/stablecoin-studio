import { HederaNetwork } from '../../../core/enum.js';
import HashPackProvider from '../hedera/hashconnect/HashPackProvider.js';
import HethersProvider from '../hedera/hethers/HethersProvider.js';
import { IProvider, IniConfigOptions } from '../hedera/Provider.js';
import { AppMetadata, NetworkMode } from '../../../sdk.js';

type NetworkClientOptions = HederaClientOptions;

type HederaClientOptions = {
	appMetadata?: AppMetadata;
};

export default class NetworkAdapter {
	private _mode: NetworkMode;
	private _network: HederaNetwork;
	private _options: NetworkClientOptions;
	
	public provider: IProvider;

	constructor(
		mode: NetworkMode,
		network: HederaNetwork,
		options: NetworkClientOptions,
	) {
		this._mode = mode;
		this._network = network;
		this._options = options;
	}

	/**
	 * Init
	 */
	public async init(): Promise<NetworkAdapter> {
		switch (this._mode) {
			case NetworkMode.EOA:
				this.provider = await this.getHethersProvider(this._network);
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
