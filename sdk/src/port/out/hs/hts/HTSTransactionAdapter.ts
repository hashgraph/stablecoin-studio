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

@singleton()
export class HTSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	public network: Environment;
	public account: Account;

	public get client(): Client {
		return this._client;
	}

	register(account: Account): Promise<TransactionAdapterInitializationData> {
		Injectable.registerTransactionHandler(this);
		this.account = account;
		this.network = account.environment;
		this._client = Client.forName(this.account.environment);
		const id = this.account.id?.value ?? '';
		const privateKey = account.privateKey?.toHashgraphKey() ?? '';
		this._client.setOperator(id, privateKey);
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
		return this.account;
	}
}
