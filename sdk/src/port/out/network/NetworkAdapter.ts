import { HederaNetwork } from '../../../core/enum.js';
import HashPackProvider from '../hedera/hashpack/HashPackProvider.js';
import HTSProvider from '../hedera/HTS/HTSProvider.js';
import { IProvider, IniConfigOptions } from '../hedera/Provider.js';
import { AppMetadata, NetworkMode } from '../../in/sdk/sdk.js';
import { InitializationData } from '../hedera/types.js';

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
		switch (this._mode) {
			case NetworkMode.EOA:
				this.provider = this.getHTSProvider();
				return this;
			case NetworkMode.HASHPACK:
				this.provider = this.getHashpackProvider();
				return this;
			default:
				throw new Error('Not supported');
		}
	}

	/**
	 * Init
	 */
	public async init(): Promise<NetworkAdapter> {
		this.provider = await this.provider.init({
			network: this.network,
			options: this._options,
		});
		return this;
	}

	public getInitData(): InitializationData {
		return this.provider.initData;
	}

	public async stop(): Promise<boolean> {
		return this.provider.stop();
	}

	private getHashpackProvider(): HashPackProvider {
		return new HashPackProvider();
	}

	private getHTSProvider(): HTSProvider {
		return new HTSProvider();
	}
}
