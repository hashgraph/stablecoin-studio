import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Client,
	TransactionResponse,
	ContractCreateFlow,
} from '@hashgraph/sdk';

export class HTSSigner implements ISigner {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	async signAndSendTransaction(
		transaction: Transaction | ContractCreateFlow,
	): Promise<TransactionResponse> {
		return await transaction.execute(this.client);
	}
}
