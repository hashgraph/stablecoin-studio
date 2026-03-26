import BaseError, { ErrorCode } from '../../../../domain/shared/error/BaseError.js';

export class EventNotFound extends BaseError {
	constructor(name: string) {
		super(ErrorCode.RuntimeError, `Event ${name} is not registered yet`);
	}
}
