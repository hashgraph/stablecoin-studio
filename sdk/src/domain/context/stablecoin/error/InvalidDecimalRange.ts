import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class InvalidDecimalRange extends BaseError {
	constructor(val: number | string, min: number, max?: number) {
		super(
			ErrorCode.InvalidRange,
			`Invalid Decimal Value ${val}, outside range ${
				max !== undefined ? `[${min}, ${max}]` : min
			}`,
		);
	}
}
