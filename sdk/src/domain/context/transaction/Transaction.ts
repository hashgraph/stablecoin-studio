/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionResponse } from './TransactionResponse.js';

export enum TransactionType {
	RECORD,
	RECEIPT,
}

export default class Transaction<
	T extends TransactionResponse = TransactionResponse,
	X extends Error = Error,
	K = Record<string, any>,
> {
	protected readonly $returnType!: K;
	constructor(
		public readonly id: string,
		public readonly response?: T,
		public readonly error?: X,
	) {}
}
