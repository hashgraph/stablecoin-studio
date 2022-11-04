import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class InvalidFormatHedera extends BaseError {
	constructor(val: unknown, type?: string) {
		super(
			ErrorCode.InvalidFormatHedera,
			`${val} not have the correct format`,
		);
	}
}
