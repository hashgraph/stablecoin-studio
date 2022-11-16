import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class TransactionResponseError extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.TransactionError, `Transaction failed: ${val}`);
	}
}
