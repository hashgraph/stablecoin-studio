import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class SigningError extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.SigningError,
			`An error ocurred when singing the transaction: ${val}`,
		);
	}
}
