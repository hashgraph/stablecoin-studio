/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
import { DeleteCommandHandler } from '../app/usecase/command/stablecoin/operations/delete/DeleteCommandHandler.js';
import { FreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/freeze/FreezeCommandHandler.js';
import { PauseCommandHandler } from '../app/usecase/command/stablecoin/operations/pause/PauseCommandHandler.js';
import { RescueCommandHandler } from '../app/usecase/command/stablecoin/operations/rescue/RescueCommandHandler.js';
import { UnFreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommandHandler.js';
import { UnPauseCommandHandler } from '../app/usecase/command/stablecoin/operations/unpause/UnPauseCommandHandler.js';
import { WipeCommandHandler } from '../app/usecase/command/stablecoin/operations/wipe/WipeCommandHandler.js';
import { DecreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommandHandler.js';
import { GetAllowanceQueryHandler } from '../app/usecase/query/stablecoin/roles/getAllowance/GetAllowanceQueryHandler.js';
import { GetRolesQueryHandler } from '../app/usecase/query/stablecoin/roles/getRoles/GetRolesQueryHandler.js';
import { GrantRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/grantRole/GrantRoleCommandHandler.js';
import { HasRoleQueryHandler } from '../app/usecase/query/stablecoin/roles/hasRole/HasRoleQueryHandler.js';
import { IncreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/increaseAllowance/IncreaseAllowanceCommandHandler.js';
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
import { RevokeSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/revokeSupplierRole/RevokeSupplierRoleCommandHandler.js';
import { GrantSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/grantSupplierRole/GrantSupplierRoleCommandHandler.js';
import { GrantUnlimitedSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/granUnlimitedSupplierRole/GrantUnlimitedSupplierRoleCommandHandler.js';
import { GetAccountTokenAssociatedQueryHandler } from '../app/usecase/query/account/tokenAssociated/GetAccountTokenAssociatedQueryHandler.js';
import { GetReserveAmountQueryHandler } from '../app/usecase/query/stablecoin/getReserveAmount/GetReserveAmountQueryHandler.js'; 
import { UpdateReserveAddressCommandHandler } from '../app/usecase/command/stablecoin/operations/updateReserveAddress/UpdateReserveAddressCommandHandler.js';
import { UpdateReserveAmountCommandHandler } from '../app/usecase/command/reserve/operations/updateReserveAmount/UpdateReserveAmountCommandHandler.js';
import { BalanceOfQueryHandler } from '../app/usecase/query/stablecoin/balanceof/BalanceOfQueryHandler.js';
import { GetReserveAddressQueryHandler } from '../app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQueryHandler.js';
import { IsUnlimitedQueryHandler } from '../app/usecase/query/stablecoin/isUnlimited/IsUnlimitedQueryHandler.js';
import { RevokeKycCommandHandler } from '../app/usecase/command/stablecoin/operations/revokeKyc/RevokeKycCommandHandler.js';
import { GrantKycCommandHandler } from '../app/usecase/command/stablecoin/operations/grantKyc/GrantKycCommandHandler.js';
import { GetAccountTokenRelationshipQuery } from '../app/usecase/query/account/tokenRelationship/GetAccountTokenRelationshipQuery.js';

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
		useClass: GrantRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: IncreaseAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ResetAllowanceCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RevokeRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RevokeSupplierRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GrantSupplierRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GrantUnlimitedSupplierRoleCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: GrantKycCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RevokeKycCommandHandler,
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
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateReserveAddressCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateReserveAmountCommandHandler,
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
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetAccountTokenAssociatedQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: BalanceOfQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetReserveAmountQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetReserveAddressQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetRolesQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: HasRoleQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetAllowanceQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: IsUnlimitedQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetAccountTokenRelationshipQuery,
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
		if (!this.currentTransactionHandler) {
			throw new RuntimeError('No Transaction Handler registered!');
		} else {
			return this.currentTransactionHandler;
		}
	}

	static registerTransactionAdapterInstances(): TransactionAdapter[] {
		const adapters: TransactionAdapter[] = [];
		if (this.isWeb()) {
			adapters.push(Injectable.resolve(HashpackTransactionAdapter));
			adapters.push(Injectable.resolve(RPCTransactionAdapter));
		} else {
			adapters.push(Injectable.resolve(HTSTransactionAdapter));
		}
		return adapters;
	}

	static isWeb(): boolean {
		return !!global.window;
	}
}
