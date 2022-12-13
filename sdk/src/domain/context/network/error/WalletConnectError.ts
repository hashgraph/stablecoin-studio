import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class WalletConnectError extends BaseError {
	constructor(error: unknown) {
		super(
			ErrorCode.RuntimeError,
			`An error ocurred while connecting to the wallet: ${error}`,
		);
		Object.setPrototypeOf(this, WalletConnectError.prototype);
	}
}
