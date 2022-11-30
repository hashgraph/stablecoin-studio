import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class InvalidValue extends BaseError {
	constructor(msg: string) {
		super(ErrorCode.InvalidValue, msg);
	}
}
