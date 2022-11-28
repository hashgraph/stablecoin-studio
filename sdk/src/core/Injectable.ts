import { CommandBase, CommandHandlerType } from './command/CommandBus.js';
import { CommandHandler } from './command/CommandHandler.js';
import { QueryBase, QueryHandlerType } from './query/QueryBus.js';
import { QueryHandler } from './query/QueryHandler.js';

export class Injectable {

	static getCommandHandler<T extends CommandBase, K extends T>(
		handler: CommandHandlerType,
	): CommandHandler<K> {
		return new handler();
	}

	static getQueryHandler<T extends QueryBase, K extends T>(
		handler: QueryHandlerType,
	): QueryHandler<K> {
		return new handler();
	}


}
