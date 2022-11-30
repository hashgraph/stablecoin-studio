import { CommandHandlerType } from './command/CommandBus.js';
import { Query } from './query/Query.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { IQueryHandler } from './query/QueryHandler.js';
import { QueryResponse } from './query/QueryResponse.js';

import { registry, container, InjectionToken } from 'tsyringe';
import { CashInCommandHandler } from '../app/usecase/stablecoin/cashin/CashInCommandHandler.js';

const TOKENS = {
	COMMAND_HANDLER: 'CommandHandler',
};

@registry([
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CashInCommandHandler,
	},
])
export class Injectable {

	static getQueryHandler<T extends Query<K>, K extends QueryResponse>(
		handler: QueryHandlerType,
	): IQueryHandler<T> {
		return new handler() as IQueryHandler<T>;
	}

	static resolve<T = unknown>(cls: InjectionToken<T>): T {
		return container.resolve(cls);
	}

	static getCommandHandlers(): CommandHandlerType[] {
		return container.resolveAll<CommandHandlerType>(TOKENS.COMMAND_HANDLER);
	}
}
