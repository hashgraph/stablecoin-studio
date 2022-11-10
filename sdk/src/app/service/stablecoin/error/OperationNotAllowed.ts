import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class OperationNotAllowed extends BaseError {
	constructor(op: string) {
		super(
			ErrorCode.OperationNotAllowed,
			`${op} is not allowed`,
		);
	}
}
