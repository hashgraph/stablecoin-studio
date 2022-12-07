import {
	registry,
	container,
	InjectionToken,
	ValueProvider,
	DependencyContainer,
	delay,
} from 'tsyringe';
import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { NetworkProps } from '../app/service/NetworkService.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteQueryHandler } from '../../__tests__/core/command/__mocks__/ConcreteQueryHandler.js';
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteCommandHandler } from '../../__tests__/core/command/__mocks__/ConcreteCommandHandler.js';
import TransactionAdapter from '../port/out/TransactionAdapter.js';
import { RuntimeError } from './error/RuntimeError.js';
import { HTSTransactionAdapter } from '../port/out/hs/hts/HTSTransactionAdapter.js';
import { HashpackTransactionAdapter } from '../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { GetStableCoinQueryHandler } from '../app/usecase/query/stablecoin/get/GetStableCoinQueryHandler.js';
import RPCTransactionAdapter from '../port/out/rpc/RPCTransactionAdapter.js';
import { Constructor } from './Type.js';
import { CashInCommandHandler } from '../app/usecase/command/stablecoin/operations/cashin/CashInCommandHandler.js';
import { MirrorNodeAdapter } from '../port/out/mirror/MirrorNodeAdapter.js';

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
		useClass: RPCTransactionAdapter,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HTSTransactionAdapter,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HashpackTransactionAdapter,
	},
];

const defaultNetworkProps: NetworkProps = {
	environment: 'testnet',
};
container.register<NetworkProps>('NetworkProps', {
	useValue: defaultNetworkProps,
});

container.register<MirrorNodeAdapter>(MirrorNodeAdapter, {
	useFactory: () => {
		return new MirrorNodeAdapter('testnet');
	},
});

@registry([...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...TRANSACTION_HANDLER])
export class Injectable {
	static readonly TOKENS = TOKENS;

	private static currentTransactionHandler: TransactionAdapter;

	static resolve<T = unknown>(cls: InjectionToken<T>): T {
		return container.resolve(cls);
	}

	static lazyResolve<T = unknown>(cls: Constructor<T>): T {
		return container.resolve(delay(() => cls));
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

	static registerTransactionHandler<T extends TransactionAdapter>(
		cls: T,
	): boolean {
		if (this.currentTransactionHandler)
			this.currentTransactionHandler.stop();
		this.currentTransactionHandler = cls;
		return true;
	}

	static disposeTransactionHandler<T extends TransactionAdapter>(
		cls: T,
	): boolean {
		return this.registerTransactionHandler(cls);
	}

	static resolveTransactionHandler(): TransactionAdapter {
		try {
			if (!this.currentTransactionHandler) {
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
