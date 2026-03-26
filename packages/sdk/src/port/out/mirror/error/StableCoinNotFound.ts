import BaseError, { ErrorCode } from '../../../../domain/shared/error/BaseError.js';

export class StableCoinNotFound extends BaseError {
	constructor(val: unknown) {
		super(ErrorCode.NotFound, `${val} was not found`);
	}
}
