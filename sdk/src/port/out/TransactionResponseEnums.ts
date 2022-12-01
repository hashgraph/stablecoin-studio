/*import {
	TransactionReceipt,
	TransactionId
} from '@hashgraph/sdk';*/

export enum TransactionType {
	RECORD,
	RECEIPT,
}
export enum Status {
	SUCCES,
	ERROR,
}
/*export class HTSResponse {
	idTransaction: string| TransactionId | undefined;
	transactionType: TransactionType;
	reponseParam: Uint8Array;
	receipt?: TransactionReceipt;

	constructor(
		idTransaction: string | TransactionId | undefined,
		transactionType: TransactionType,
		reponseParam: Uint8Array,
		receipt?: TransactionReceipt,
	) {
		this.idTransaction = idTransaction;
		this.transactionType = transactionType;
		this.reponseParam = reponseParam;
		this.receipt = receipt;
	}
}*/