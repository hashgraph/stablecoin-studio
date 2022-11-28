/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from './Command.interface.js';
import { CommandResponse } from './CommandResponse.interface.js';

export interface ICommandHandler<
	TCommand extends Command = Command,
	TResult extends CommandResponse = CommandResponse,
> {
	execute(command: TCommand): Promise<TResult>;
}
