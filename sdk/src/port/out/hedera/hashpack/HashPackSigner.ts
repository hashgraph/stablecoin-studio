import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
} from '@hashgraph/sdk';

export class HashPackSigner implements ISigner {
	async signAndSendTransaction(
		transaction:
			| Transaction
			| ContractExecuteTransaction
			| ContractCreateFlow,
		signer?: Signer,
	): Promise<TransactionResponse> {
		if (signer) {
			console.log(transaction);
			const trans = await transaction.executeWithSigner(signer);
			return trans;
		}
		throw new Error('Its necessary to have a Signer');
	}
}
