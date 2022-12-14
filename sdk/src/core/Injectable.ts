import {
	registry,
	container,
	InjectionToken,
	ValueProvider,
	DependencyContainer,
	delay,
} from 'tsyringe';
import { GetStableCoinQueryHandler } from '../app/usecase/query/stablecoin/get/GetStableCoinQueryHandler.js';
import RPCTransactionAdapter from '../port/out/rpc/RPCTransactionAdapter.js';
import { Constructor } from './Type.js';
import { CreateCommandHandler } from '../app/usecase/command/stablecoin/create/CreateCommandHandler.js';
import { CashInCommandHandler } from '../app/usecase/command/stablecoin/operations/cashin/CashInCommandHandler.js';
import { BurnCommandHandler } from '../app/usecase/command/stablecoin/operations/burn/BurnCommandHandler.js';
import { BalanceOfCommandHandler } from '../app/usecase/command/stablecoin/operations/balanceof/BalanceOfCommandHandler.js';
import { DeleteCommandHandler } from '../app/usecase/command/stablecoin/operations/delete/DeleteCommandHandler.js';
import { FreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/freeze/FreezeCommandHandler.js';
import { PauseCommandHandler } from '../app/usecase/command/stablecoin/operations/pause/PauseCommandHandler.js';
import { RescueCommandHandler } from '../app/usecase/command/stablecoin/operations/rescue/RescueCommandHandler.js';
import { UnFreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommandHandler.js';
import { UnPauseCommandHandler } from '../app/usecase/command/stablecoin/operations/unpause/UnPauseCommandHandler.js';
import { WipeCommandHandler } from '../app/usecase/command/stablecoin/operations/wipe/WipeCommandHandler.js';
import { DecreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommandHandler.js';
import { GetAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/getAllowance/GetAllowanceCommandHandler.js';
import { GetRolesCommandHandler } from '../app/usecase/command/stablecoin/roles/getRoles/GetRolesCommandHandler.js';
import { GrantRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/grantRole/GrantRoleCommandHandler.js';
import { HasRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/hasRole/HasRoleCommandHandler.js';
import { IncreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/increaseAllowance/IncreaseAllowanceCommandHandler.js';
import { IsLimitedCommandHandler } from '../app/usecase/command/stablecoin/roles/isLimited/IsLimitedCommandHandler.js';
import { IsUnlimitedCommandHandler } from '../app/usecase/command/stablecoin/roles/isUnlimited/IsUnlimitedCommandHandler.js';
import { ResetAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/resetAllowance/ResetAllowanceCommandHandler.js';
import { RevokeRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/revokeRole/RevokeRoleCommandHandler.js';
import { ConnectCommandHandler } from '../app/usecase/command/network/connect/ConnectCommandHandler.js';
import { DisconnectCommandHandler } from '../app/usecase/command/network/disconnect/DisconnectCommandHandler.js';
import { GetListStableCoinQueryHandler } from '../app/usecase/query/stablecoin/list/GetListStableCoinQueryHandler.js';
import { GetAccountInfoQueryHandler } from '../app/usecase/query/account/info/GetAccountInfoQueryHandler.js';
import { SetNetworkCommandHandler } from '../app/usecase/command/network/setNetwork/SetNetworkCommandHandler.js';
import { WalletEvents } from '../app/service/event/WalletEvent.js';
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

export const TOKENS = {
	COMMAND_HANDLER: Symbol('CommandHandler'),
	QUERY_HANDLER: Symbol('QueryHandler'),
	TRANSACTION_HANDLER: 'TransactionHandler',
};

const COMMAND_HANDLERS = [
	// Mock
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ConcreteCommandHandler,
	},
	// Stable Coin Creation
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CreateCommandHandler,
	},
	// Stable Coin Operations
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CashInCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: BurnCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: BalanceOfCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: BurnCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: DeleteCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: FreezeCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: PauseCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RescueCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UnFreezeCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UnPauseCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: WipeCommandHandler,
	},
	// Stable Coin Role Operations
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: DecreaseAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GetAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GetRolesCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GrantRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: HasRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: IncreaseAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: IsLimitedCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: IsUnlimitedCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ResetAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RevokeRoleCommandHandler,
	},
	// Network Operations
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ConnectCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: DisconnectCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: SetNetworkCommandHandler,
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
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetListStableCoinQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetAccountInfoQueryHandler,
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

// Network default props
container.register<NetworkProps>('NetworkProps', {
	useValue: defaultNetworkProps,
});

// Wallet events
container.register<typeof WalletEvents>('WalletEvents', {
	useValue: WalletEvents,
});

@registry([...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...TRANSACTION_HANDLER])
export default class Injectable {
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
