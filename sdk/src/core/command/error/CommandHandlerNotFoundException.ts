import BaseError, { ErrorCode } from '../../error/BaseError.js';

export class CommandHandlerNotFoundException extends BaseError {
	constructor(commandName: string) {
		super(
			ErrorCode.RuntimeError,
			`The command handler for the "${commandName}" command was not found!`,
		);
	}
}
