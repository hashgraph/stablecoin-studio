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

	public async signAndSendTransaction(
		t: Transaction,
	): Promise<TransactionResponse> {
		try {
			const tr: HTransactionResponse = await t.execute(this.client);
			return HTSTransactionResponseAdapter.manageResponse(
				tr,
				TransactionType.RECEIPT,
				this.client,
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
