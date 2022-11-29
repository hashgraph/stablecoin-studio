/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionResponse } from './TransactionResponse.js';

export enum TransactionType {
	RECORD,
	RECEIPT,
}

export default class Transaction<
	K = Record<string, any>,
	X extends Error = Error,
	T extends TransactionResponse = TransactionResponse,
> {
	constructor(
		protected readonly $returnType: K,
		public readonly id: string,
		public readonly error?: X,
		public readonly response?: T,
	) {}
}
