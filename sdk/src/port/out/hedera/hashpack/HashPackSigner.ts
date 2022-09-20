import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	Client,
} from '@hashgraph/sdk';

export class HashPackSigner extends ISigner {
	constructor(client: Client | undefined) {
		super(client);
	}

	async signAndSendTransaction(
		transaction: Transaction,
		signer?: Signer,
	): Promise<TransactionResponse> {
		if (signer) {
			transaction.signWithSigner(signer);
			return transaction.executeWithSigner(signer);
		}
		throw new Error('Is necessary to have a Signer');
	}
}
