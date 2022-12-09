import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';
import { TransactionResponseError } from '../transaction/error/TransactionResponseError.js';

export class DeploymentError extends BaseError {
	transactionError?: TransactionResponseError;
	constructor(val: unknown, transactionError?: TransactionResponseError) {
		super(
			ErrorCode.DeplymentError,
			`An error ocurred during deployment: ${val}`,
		);
		this.transactionError = transactionError;
	}
}
