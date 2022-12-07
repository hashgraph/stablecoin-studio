import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class StableCoinNotFound extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.NotFound, `${val} was not found`);
	}
}