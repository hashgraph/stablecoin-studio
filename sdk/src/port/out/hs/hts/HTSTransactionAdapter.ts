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

@singleton()
export class HTSTransactionAdapter extends HederaTransactionAdapter {

	private _client: Client;

	public get client() {
		return this._client;
	}

	constructor(client: Client) {
		super();
		this._client = client;
	}

	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}

	public async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[]
	): Promise<TransactionResponse> {
		try {
			const tr: HTransactionResponse = await t.execute(this.client);
			return HTSTransactionResponseAdapter.manageResponse(
				tr,
				transactionType,
				this.client,
				functionName,
				abi
			);
		} catch (error) {
			console.log(`echo3 -> ${error}`);
			throw error;
		}
    }

    getAccount(): string {
        throw new Error('Method not implemented.');
    }
}
