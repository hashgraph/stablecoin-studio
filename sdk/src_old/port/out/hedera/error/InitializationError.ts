import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InitializationError extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.InitializationError,
			`An error ocurred when initializing the provider: ${val}`,
		);
	}
}
