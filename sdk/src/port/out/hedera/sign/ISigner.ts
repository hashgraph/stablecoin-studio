import {
	Transaction,
	TransactionResponse,
	TransactionReceipt,
} from '@hashgraph/sdk';
import { MessageTypes } from 'hashconnect';

export enum TransactionType {
	RECORD,
	RECEIPT,
}
export enum Status {
	SUCCES,
	ERROR,
}
export class HTSResponse {
	idTransaction: string;
	transactionType: TransactionType;
	reponseParam: Uint8Array;
	receipt?: TransactionReceipt;

	constructor(
		idTransaction: string,
		transactionType: TransactionType,
		reponseParam: Uint8Array,
		receipt?: TransactionReceipt,
	) {
		this.idTransaction = idTransaction;
		this.transactionType = transactionType;
		this.reponseParam = reponseParam;
		this.receipt = receipt;
	}
}
export interface ISigner {
	signAndSendTransaction(
		transaction: Transaction,
	): Promise<TransactionResponse | MessageTypes.TransactionResponse>;
}
