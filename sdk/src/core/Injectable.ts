import {
	registry,
	container,
	InjectionToken,
	ValueProvider,
	DependencyContainer,
} from 'tsyringe';
import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { CashInCommandHandler } from '../app/usecase/command/stablecoin/cashin/CashInCommandHandler.js';
import { NetworkProps } from '../app/service/NetworkService.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteQueryHandler } from '../../__tests__/core/command/__mocks__/ConcreteQueryHandler.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteCommandHandler } from '../../__tests__/core/command/__mocks__/ConcreteCommandHandler.js';
import TransactionHandler from '../port/out/TransactionHandler.js';
import { RuntimeError } from './error/RuntimeError.js';
import { HTSTransactionHandler } from '../port/out/handler/HTSTransactionHandler.js';
import RPCTransactionHandler from '../port/out/handler/RPCTransactionHandler.js';
import { HashpackTransactionHandler } from '../port/out/handler/HashpackTransactionHandler.js';
import { NullTransactionHandler } from '../port/out/handler/NullTransactionHandler.js';
import { GetStableCoinQueryHandler } from '../app/usecase/query/stablecoin/GetStableCoinQueryHandler.js';

export const TOKENS = {
	COMMAND_HANDLER: Symbol('CommandHandler'),
	QUERY_HANDLER: Symbol('QueryHandler'),
	TRANSACTION_HANDLER: 'TransactionHandler',
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
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetStableCoinQueryHandler,
	},
];

const TRANSACTION_HANDLER = [
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: RPCTransactionHandler,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HTSTransactionHandler,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HashpackTransactionHandler,
	},
];

const defaultNetworkProps: NetworkProps = {
	environment: 'testnet',
};
container.register<NetworkProps>('NetworkProps', {
	useValue: defaultNetworkProps,
});

@registry([...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...TRANSACTION_HANDLER])
export class Injectable {
	static readonly TOKENS = TOKENS;
	
	private static currentTransactionHandler = Injectable.resolve(
		NullTransactionHandler,
	);

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

	static registerTransactionHandler<T extends TransactionHandler>(
		cls: T,
	): boolean {
		this.currentTransactionHandler = cls;
		return true;
	}

	static disposeTransactionHandler<T extends TransactionHandler>(
		cls: T,
	): boolean {
		this.disposeTransactionHandlers();
		return this.registerTransactionHandler(cls);
	}

	private static disposeTransactionHandlers(): boolean {
		this.currentTransactionHandler = Injectable.resolve(
			NullTransactionHandler,
		);
		return true;
	}

	static resolveTransactionhandler(): TransactionHandler {
		try {
			if (
				this.currentTransactionHandler instanceof
					NullTransactionHandler ||
				null
			) {
				throw new RuntimeError('No Transaction Handler registered!');
			} else {
				return this.currentTransactionHandler;
			}
		} catch (error) {
			console.error(error);
			throw new RuntimeError('No Transaction Handler registered!');
		}
	}
}
