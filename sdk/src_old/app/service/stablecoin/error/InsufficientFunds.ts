import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InsufficientFunds extends BaseError {
	constructor(id: string) {
		super(
			ErrorCode.InsufficientFunds,
			`Insufficient funds in account ${id}`,
		);
	}
}
