import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';

import { registry, container, InjectionToken } from 'tsyringe';
import { CashInCommandHandler } from '../app/usecase/stablecoin/cashin/CashInCommandHandler.js';

const TOKENS = {
	COMMAND_HANDLER: 'CommandHandler',
	QUERY_HANDLER: 'QueryHandler',
};

const COMMAND_HANDLERS = [
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CashInCommandHandler,
	},
];

const QUERY_HANDLERS = [
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: CashInCommandHandler,
	},
];

@registry([...COMMAND_HANDLERS, ...QUERY_HANDLERS])
export class Injectable {
	static resolve<T = unknown>(cls: InjectionToken<T>): T {
		return container.resolve(cls);
	}

	static getQueryHandlers(): QueryHandlerType[] {
		return container.resolveAll<QueryHandlerType>(TOKENS.QUERY_HANDLER);
	}

	static getCommandHandlers(): CommandHandlerType[] {
		return container.resolveAll<CommandHandlerType>(TOKENS.COMMAND_HANDLER);
	}
}
