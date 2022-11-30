/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../core/decorator/CommandHandlerDecorator.js';
import { CashInCommand, CashInCommandResponse } from './CashInCommand.js';

@CommandHandler(CashInCommand)
export class CashInCommandHandler implements ICommandHandler<CashInCommand> {
	execute(command: CashInCommand): Promise<CashInCommandResponse> {
		const res = new CashInCommandResponse(true);
		// TODO Do some work here
		return Promise.resolve(res);
	}
}
