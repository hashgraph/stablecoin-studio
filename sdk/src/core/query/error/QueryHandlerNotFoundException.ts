import BaseError, { ErrorCode } from '../../error/BaseError.js';

export class QueryHandlerNotFoundException extends BaseError {
	constructor(queryName: string) {
		super(
			ErrorCode.RuntimeError,
			`The query handler for the "${queryName}" query was not found!`,
		);
	}
}
