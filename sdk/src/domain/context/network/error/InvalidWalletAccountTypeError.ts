import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidWalletAccountTypeError extends BaseError {
	constructor(accountId: string, wallet: string) {
		super(
			ErrorCode.OperationNotAllowed,
			`Account: ${accountId} is of invalid format for wallet: ${wallet}`,
		);
		Object.setPrototypeOf(this, InvalidWalletAccountTypeError.prototype);
	}
}
