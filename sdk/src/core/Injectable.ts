import {
	registry,
	container,
	InjectionToken,
	ValueProvider,
	DependencyContainer,
} from 'tsyringe';
import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { CashInCommandHandler } from '../app/usecase/stablecoin/cashin/CashInCommandHandler.js';
import { NetworkProps } from '../app/service/NetworkService.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteQueryHandler } from '../../__tests__/core/command/__mocks__/ConcreteQueryHandler.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteCommandHandler } from '../../__tests__/core/command/__mocks__/ConcreteCommandHandler.js';

const TOKENS = {
	COMMAND_HANDLER: 'CommandHandler',
	QUERY_HANDLER: 'QueryHandler',
};

const COMMAND_HANDLERS = [
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CashInCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ConcreteCommandHandler,
	},
];

const QUERY_HANDLERS = [
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: ConcreteQueryHandler,
	},
];

const defaultNetworkProps: NetworkProps = {
	environment: 'testnet',
};
container.register<NetworkProps>('NetworkProps', {
	useValue: defaultNetworkProps,
});

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

	static register<T = unknown>(
		token: InjectionToken<T>,
		value: ValueProvider<T>,
	): DependencyContainer {
		return container.register(token, value);
	}

	static registerCommandHandler<T = unknown>(
		cls: ValueProvider<T>,
	): DependencyContainer {
		return container.register(TOKENS.COMMAND_HANDLER, cls);
	}
}
