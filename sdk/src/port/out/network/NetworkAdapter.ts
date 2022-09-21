import { HederaNetwork } from '../../../core/enum.js';
import HashPackProvider from '../hedera/hashpack/HashPackProvider.js';
import HTSProvider from '../hedera/HTS/HTSProvider.js';
import { IProvider, IniConfigOptions } from '../hedera/Provider.js';
import { AppMetadata, NetworkMode } from '../../in/sdk/sdk.js';

type NetworkClientOptions = HederaClientOptions;

type HederaClientOptions = {
	appMetadata?: AppMetadata;
};

export default class NetworkAdapter {
	private _mode: NetworkMode;
	public network: HederaNetwork;
	private _options: NetworkClientOptions;

	private _provider: IProvider;
	public get provider(): IProvider {
		return this._provider;
	}
	public set provider(value: IProvider) {
		this._provider = value;
	}

	constructor(
		mode: NetworkMode,
		network: HederaNetwork,
		options: NetworkClientOptions,
	) {
		this._mode = mode;
		this.network = network;
		this._options = options;
	}

	/**
	 * Init
	 */
	public async init(): Promise<NetworkAdapter> {
		switch (this._mode) {
			case NetworkMode.EOA:
				this.provider = await this.getHTSProvider(this.network);
				return this;
			case NetworkMode.HASHPACK:
				this.provider = await this.getHashpackProvider(
					this.network,
					this._options,
				);
				return this;
			default:
				throw new Error('Not supported');
		}
	}

	public async stop(): Promise<boolean> {
		return this.provider.stop();
	}

	private getHashpackProvider(
		network: HederaNetwork,
		options: IniConfigOptions,
	): Promise<HashPackProvider> {
		return new HashPackProvider().init({ network, options });
	}

	private getHTSProvider(network: HederaNetwork): Promise<HTSProvider> {
		return new HTSProvider().init({ network });
	}
}
