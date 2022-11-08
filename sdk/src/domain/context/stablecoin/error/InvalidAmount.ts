import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class InvalidAmount extends BaseError {
	constructor(val: number | string, expected: number | string) {
		super(
			ErrorCode.InvalidAmount,
			`Invalid Amount ${val}, expected ${expected} decimals`,
		);
	}
}
