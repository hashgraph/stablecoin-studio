import { Command } from './command/Command.js';
import { CommandHandlerType } from './command/CommandBus.js';
import { ICommandHandler } from './command/CommandHandler.interface.js';
import { CommandResponse } from './command/CommandResponse.interface.js';
import { QueryBase, QueryHandlerType } from './query/QueryBus.js';
import { QueryHandler } from './query/QueryHandler.js';

export class Injectable {
	static getCommandHandler<T extends Command<K>, K extends CommandResponse>(
		handler: CommandHandlerType,
	): ICommandHandler<T> {
		return new handler() as ICommandHandler<T>;
	}

	static getQueryHandler<T extends QueryBase, K extends T>(
		handler: QueryHandlerType,
	): QueryHandler<K> {
		return new handler();
	}
}
