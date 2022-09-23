import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
} from '@hashgraph/sdk';

export class HashPackSigner implements ISigner {
	async signAndSendTransaction(
		transaction: Transaction | ContractCreateFlow,
		signer?: Signer,
	): Promise<TransactionResponse> {
		if (signer) {
			return await transaction.executeWithSigner(signer);
		}
		throw new Error('Its necessary to have a Signer');
	}
}
