/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from './Response.js';

export enum TransactionType {
	RECORD,
	RECEIPT,
}

export default class TransactionResponse<
	K = Record<string, any>,
	X extends Error = Error,
	T extends Response = Response,
> {
	constructor(
		protected readonly $returnType: K,
		public readonly id: string,
		public readonly error?: X,
		public readonly response?: T,
	) {}
}
