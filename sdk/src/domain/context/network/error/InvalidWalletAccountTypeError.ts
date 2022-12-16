import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidWalletTypeError extends BaseError {
	constructor( wallet: string) {
		super(
			ErrorCode.OperationNotAllowed,
			`Wallet: ${wallet} is not allowed.`,
		);
		Object.setPrototypeOf(this, InvalidWalletTypeError.prototype);
	}
}
