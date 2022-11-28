import BaseError, { ErrorCode } from './BaseError.js';

export class RuntimeError extends BaseError {
	constructor(msg: string) {
		super(ErrorCode.RuntimeError, `Runtime error: ${msg}`);
	}
}
