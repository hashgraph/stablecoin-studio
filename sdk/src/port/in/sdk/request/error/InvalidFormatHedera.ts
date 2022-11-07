import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class InvalidFormatHedera extends BaseError {
	constructor(val: unknown) {
		super(
			ErrorCode.InvalidIdFormatHedera,
			`${val} does not have the correct format`,
		);
	}
}
