/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from './Command.js';

export type ICommandHandler<CommandType extends Command<unknown>> =
	CommandType extends Command<infer ResultType>
		? {
				execute(command: CommandType): Promise<ResultType>;
		  }
		: never;
