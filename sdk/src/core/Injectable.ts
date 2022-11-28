import { Command } from './command/Command.interface.js';
import { CommandHandlerType } from './command/CommandBus.js';
import { ICommandHandler } from './command/CommandHandler.interface.js';
import { QueryBase, QueryHandlerType } from './query/QueryBus.js';
import { QueryHandler } from './query/QueryHandler.js';

export class Injectable {

	static getCommandHandler<T extends Command, K extends T>(
		handler: CommandHandlerType,
	): ICommandHandler<K> {
		return new handler();
	}

	static getQueryHandler<T extends QueryBase, K extends T>(
		handler: QueryHandlerType,
	): QueryHandler<K> {
		return new handler();
	}


}
