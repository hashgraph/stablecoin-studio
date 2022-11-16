import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class TransactionBuildingError extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.TransactionCheck,
			`An error ocurred when building the transaction: ${val}`,
		);
	}
}
