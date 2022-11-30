/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from './Response.js';

export enum TransactionType {
	RECORD,
	RECEIPT,
}

export default class TransactionResponse<
	T extends Response = Response,
	X extends Error = Error,
> {
	constructor(
		public readonly id?: string,
		public readonly response?: T,
		public readonly error?: X,
	) {}
}
