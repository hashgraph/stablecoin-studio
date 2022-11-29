import { Command } from './command/Command.js';
import { CommandHandlerType } from './command/CommandBus.js';
import { ICommandHandler } from './command/CommandHandler.interface.js';
import { CommandResponse } from './command/CommandResponse.interface.js';
import { Query } from './query/Query.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { IQueryHandler } from './query/QueryHandler.interface.js';
import { QueryResponse } from './query/QueryResponse.interface.js';


export class Injectable {
	static getCommandHandler<T extends Command<K>, K extends CommandResponse>(
		handler: CommandHandlerType,
	): ICommandHandler<T> {
		return new handler() as ICommandHandler<T>;
	}

	static getQueryHandler<T extends Query<K>, K extends QueryResponse>(
		handler: QueryHandlerType,
	): IQueryHandler<T> {
		return new handler() as IQueryHandler<T>;
	}

}
