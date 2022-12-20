import {
	TransactionResponse as HTransactionResponse,
	Transaction,
	Client,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { HTSTransactionResponseAdapter } from './HTSTransactionResponseAdapter.js';
import Injectable from '../../../../core/Injectable.js';
import { InitializationData } from '../../TransactionAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { Environment } from '../../../../domain/context/network/Environment.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import EventService from '../../../../app/service/event/EventService.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import LogService from '../../../../app/service/LogService.js';

@singleton()
export class HTSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	public network: Environment;
	public account: Account;

	public get client(): Client {
		return this._client;
	}

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {
		super(mirrorNodeAdapter);
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.CLIENT,
			initData: {},
		});
		LogService.logTrace('Client Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(account: Account): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			account.id,
		);
		this.account = account;
		this.account.publicKey = accountMirror.publicKey;
		this.network = this.networkService.environment;
		this._client = Client.forName(this.networkService.environment);
		const id = this.account.id?.value ?? '';
		const privateKey = account.privateKey?.toHashgraphKey() ?? '';
		this._client.setOperator(id, privateKey);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HASHPACK,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: this.networkService.environment,
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
		LogService.logTrace('Client registered as handler: ', eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		this.client.close();
		LogService.logTrace('Client stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.CLIENT,
		});
		return Promise.resolve(true);
	}

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[],
	): Promise<TransactionResponse> {
		const tr: HTransactionResponse = await t.execute(this.client);
		return HTSTransactionResponseAdapter.manageResponse(
			tr,
			transactionType,
			this.client,
			functionName,
			abi,
		);
	}

	getAccount(): Account {
		return this.account;
	}
}
