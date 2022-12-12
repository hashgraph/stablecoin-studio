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
import { Injectable } from '../../../../core/Injectable.js';
import { TransactionAdapterInitializationData } from '../../TransactionAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { Environment } from '../../../../domain/context/network/Environment.js';
import {
	WalletInitEvent,
	WalletEvents,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import EventService from '../../../../app/service/event/EventService.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';

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
		public readonly mirrorNodeAdapter: MirrorNodeAdapter
	) {
		super(mirrorNodeAdapter);
	}

	register(account: Account): Promise<TransactionAdapterInitializationData> {
		Injectable.registerTransactionHandler(this);
		this.account = account;
		this.network = account.environment;
		this._client = Client.forName(this.account.environment);
		const id = this.account.id?.value ?? '';
		const privateKey = account.privateKey?.toHashgraphKey() ?? '';
		this._client.setOperator(id, privateKey);
		const eventData: WalletInitEvent = {
			wallet: SupportedWallets.HASHPACK,
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		this.client.close();
		this.eventService.emit(WalletEvents.walletDisconnect);
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[],
	): Promise<TransactionResponse> {
		try {
			const tr: HTransactionResponse = await t.execute(this.client);
			return HTSTransactionResponseAdapter.manageResponse(
				tr,
				transactionType,
				this.client,
				functionName,
				abi,
			);
		} catch (error) {
			console.log(`echo3 -> ${error}`);
			throw error;
		}
	}

	getAccount(): Account {
		return this.account;
	}
}
