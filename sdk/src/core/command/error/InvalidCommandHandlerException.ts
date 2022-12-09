import BaseError, { ErrorCode } from '../../error/BaseError.js';

export class InvalidCommandHandlerException extends BaseError {
	constructor() {
		super(
			ErrorCode.RuntimeError,
			`Invalid command handler exception (missing @CommandHandler() decorator?)`,
		);
	}
}
