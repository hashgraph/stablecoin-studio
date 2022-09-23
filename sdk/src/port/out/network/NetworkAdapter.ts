import { HederaNetwork } from '../../../core/enum.js';
import HashPackProvider from '../hedera/hashpack/HashPackProvider.js';
import HTSProvider from '../hedera/HTS/HTSProvider.js';
import { IProvider } from '../hedera/Provider.js';
import { AppMetadata, NetworkMode } from '../../in/sdk/sdk.js';
import { InitializationData } from '../hedera/types.js';
import EventService from '../../../app/service/event/EventService.js';
import ProviderEvent from '../hedera/ProviderEvent.js';

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
		eventService: EventService,
		mode: NetworkMode,
		network: HederaNetwork,
		options: NetworkClientOptions,
	) {
		this._mode = mode;
		this.network = network;
		this._options = options;
		switch (this._mode) {
			case NetworkMode.EOA:
				this.provider = new HTSProvider(eventService);
				return this;
			case NetworkMode.HASHPACK:
				this.provider = new HashPackProvider(eventService);
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
		console.log(this);
		return this;
	}

	public getInitData(): InitializationData {
		return this.provider.initData;
	}

	public async stop(): Promise<boolean> {
		return this.provider.stop();
	}
}
