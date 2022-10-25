import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export default class InvalidDecimalRange extends BaseError {
	constructor(val: number, min: number, max: number) {
		super(
			ErrorCode.DecimalRangeInvalid,
			`Invalid Decimal Value ${val}, outside range [${min}, ${max}]`,
		);
	}
}
