import BaseError, { ErrorCode } from '../../error/BaseError.js';

export class InvalidQueryHandlerException extends BaseError {
	constructor() {
		super(
			ErrorCode.RuntimeError,
			`Invalid query handler exception (missing @QueryHandler() decorator?)`,
		);
	}
}
