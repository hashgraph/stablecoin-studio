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
		let t = transaction;
		if (transaction instanceof Transaction) {
			t = transaction.freezeWith(this.client);
		}else if(transaction instanceof ContractCreateFlow){
			transaction._contractCreate = transaction._contractCreate.freezeWith(
				this.client,
				);
			console.log(transaction._contractCreate);
		}
		return await t.execute(this.client);
	}
}
