import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidIdFormat extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.InvalidIdFormatHedera,
			`Value "${val}" does not have the correct format (0.0.0)`,
		);
	}
}
