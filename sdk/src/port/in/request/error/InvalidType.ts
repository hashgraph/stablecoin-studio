import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class InvalidType extends BaseError {
	constructor(val: unknown, type?: string) {
		super(
			ErrorCode.InvalidType,
			`Value ${val} is not of a valid type${
				type && `, expected ${type}`
			}`,
		);
	}
}
