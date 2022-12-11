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
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';

@singleton()
export class HTSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;

	public get client(): Client {
		return this._client;
	}

	constructor(
		public readonly network: Environment,
		public readonly account: Account,
		@lazyInject(MirrorNodeAdapter) 
		public readonly mirrorNodeAdapter: MirrorNodeAdapter
	) {
		super(mirrorNodeAdapter);
		this._client = Client.forName(network);
		const id = this.account.id?.value ?? '';
		const privateKey = account.privateKey?.toHashgraphKey() ?? '';
console.log(`${id}: ${privateKey}`);		
		this._client.setOperator(id, privateKey);
	}

	register(): Promise<TransactionAdapterInitializationData> {
		Injectable.registerTransactionHandler(this);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}
	stop(): Promise<boolean> {
		this.client.close();
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
		return new Account({
			id: this.client?.operatorAccountId?.toString(),
			environment: this.network,
		});
	}
}
