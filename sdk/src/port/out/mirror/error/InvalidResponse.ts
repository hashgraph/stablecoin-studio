import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidResponse extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.InvalidResponse,
			`An invalid response was received from the server: ${val}`,
		);
	}
}
