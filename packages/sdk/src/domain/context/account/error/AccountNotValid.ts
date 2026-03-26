import BaseError, { ErrorCode } from '../../../shared/error/BaseError.js';

export class AccountNotValid extends BaseError {
	constructor(cause: string) {
		super(ErrorCode.InvalidAmount, `Account is not valid: ${cause}`);
	}
}
