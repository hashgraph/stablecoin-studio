import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
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
		signer?: Signer,
	): Promise<TransactionResponse> {
        return await transaction.execute(this.client);
	}


}
