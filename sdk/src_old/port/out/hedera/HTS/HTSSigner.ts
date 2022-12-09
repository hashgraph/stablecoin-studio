import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Client,
	TransactionResponse,
	ContractCreateFlow,
} from '@hashgraph/sdk';
import { SigningError } from '../error/SigningError.js';

export class HTSSigner implements ISigner {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	async signAndSendTransaction(
		transaction: Transaction | ContractCreateFlow,
	): Promise<TransactionResponse> {
		try {
			return await transaction.execute(this.client);
		} catch (error) {
			throw new SigningError(error);
		}
	}
}
