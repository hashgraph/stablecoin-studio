import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class PairingError extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.PairingError,
			`An error ocurred when pairing: ${val}`,
		);
	}
}
