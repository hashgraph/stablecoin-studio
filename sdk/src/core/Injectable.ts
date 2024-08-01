/*
 *
 * Hedera Stablecoin SDK
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
import { UpdateCommandHandler } from '../app/usecase/command/stablecoin/update/UpdateCommandHandler.js';
import { CashInCommandHandler } from '../app/usecase/command/stablecoin/operations/cashin/CashInCommandHandler.js';
import { BurnCommandHandler } from '../app/usecase/command/stablecoin/operations/burn/BurnCommandHandler.js';
import { TransfersCommandHandler } from '../app/usecase/command/stablecoin/operations/transfer/TransfersCommandHandler.js';
import { DeleteCommandHandler } from '../app/usecase/command/stablecoin/operations/delete/DeleteCommandHandler.js';
import { FreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/freeze/FreezeCommandHandler.js';
import { PauseCommandHandler } from '../app/usecase/command/stablecoin/operations/pause/PauseCommandHandler.js';
import { RescueCommandHandler } from '../app/usecase/command/stablecoin/operations/rescue/RescueCommandHandler.js';
import { RescueHBARCommandHandler } from '../app/usecase/command/stablecoin/operations/rescueHBAR/RescueHBARCommandHandler.js';
import { UnFreezeCommandHandler } from '../app/usecase/command/stablecoin/operations/unfreeze/UnFreezeCommandHandler.js';
import { UnPauseCommandHandler } from '../app/usecase/command/stablecoin/operations/unpause/UnPauseCommandHandler.js';
import { WipeCommandHandler } from '../app/usecase/command/stablecoin/operations/wipe/WipeCommandHandler.js';
import { AssociateCommandHandler } from '../app/usecase/command/account/associate/AssociateCommandHandler.js';
import { DecreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/decreaseAllowance/DecreaseAllowanceCommandHandler.js';
import { GetAllowanceQueryHandler } from '../app/usecase/query/stablecoin/roles/getAllowance/GetAllowanceQueryHandler.js';
import { GetRolesQueryHandler } from '../app/usecase/query/stablecoin/roles/getRoles/GetRolesQueryHandler.js';
import { GrantRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/grantRole/GrantRoleCommandHandler.js';
import { GrantMultiRolesCommandHandler } from '../app/usecase/command/stablecoin/roles/grantMultiRoles/GrantMultiRolesCommandHandler.js';
import { HasRoleQueryHandler } from '../app/usecase/query/stablecoin/roles/hasRole/HasRoleQueryHandler.js';
import { IncreaseAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/increaseAllowance/IncreaseAllowanceCommandHandler.js';
import { ResetAllowanceCommandHandler } from '../app/usecase/command/stablecoin/roles/resetAllowance/ResetAllowanceCommandHandler.js';
import { RevokeRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/revokeRole/RevokeRoleCommandHandler.js';
import { RevokeMultiRolesCommandHandler } from '../app/usecase/command/stablecoin/roles/revokeMultiRoles/RevokeMultiRolesCommandHandler.js';
import { ConnectCommandHandler } from '../app/usecase/command/network/connect/ConnectCommandHandler.js';
import { DisconnectCommandHandler } from '../app/usecase/command/network/disconnect/DisconnectCommandHandler.js';
import { GetListStableCoinQueryHandler } from '../app/usecase/query/stablecoin/list/GetListStableCoinQueryHandler.js';
import { GetAccountInfoQueryHandler } from '../app/usecase/query/account/info/GetAccountInfoQueryHandler.js';
import { SetNetworkCommandHandler } from '../app/usecase/command/network/setNetwork/SetNetworkCommandHandler.js';
import { addFixedFeesCommandHandler } from '../app/usecase/command/stablecoin/fees/addCustomFees/addFixedFeesCommandHandler.js';
import { addFractionalFeesCommandHandler } from '../app/usecase/command/stablecoin/fees/addCustomFees/addFractionalFeesCommandHandler.js';
import { UpdateCustomFeesCommandHandler } from '../app/usecase/command/stablecoin/fees/updateCustomFees/UpdateCustomFeesCommandHandler.js';
import { UpgradeImplementationCommandHandler } from '../app/usecase/command/proxy/upgrade/UpgradeImplementationCommandHandler.js';
import { UpgradeFactoryImplementationCommandHandler } from '../app/usecase/command/factoryProxy/upgrade/UpgradeFactoryImplementationCommandHandler.js';
import { ChangeOwnerCommandHandler } from '../app/usecase/command/proxy/changeOwner/ChangeOwnerCommandHandler.js';
import { AcceptOwnerCommandHandler } from '../app/usecase/command/proxy/acceptOwner/AcceptOwnerCommandHandler.js';
import { ChangeFactoryOwnerCommandHandler } from '../app/usecase/command/factoryProxy/changeOwner/ChangeFactoryOwnerCommandHandler.js';
import { AcceptFactoryOwnerCommandHandler } from '../app/usecase/command/factoryProxy/acceptOwner/AcceptFactoryOwnerCommandHandler.js';

import { WalletEvents } from '../app/service/event/WalletEvent.js';
import { CommandHandlerType } from './command/CommandBus.js';
import { QueryHandlerType } from './query/QueryBus.js';
import { NetworkProps } from '../app/service/NetworkService.js';
// eslint-disable-next-line jest/no-mocks-import
//import { ConcreteQueryHandler } from '../../__tests__/core/command/__mocks__/ConcreteQueryHandler.js';
// eslint-disable-next-line jest/no-mocks-import
//import { ConcreteCommandHandler } from '../../__tests__/core/command/__mocks__/ConcreteCommandHandler.js';
import TransactionAdapter from '../port/out/TransactionAdapter.js';
import { RuntimeError } from './error/RuntimeError.js';
import { HTSTransactionAdapter } from '../port/out/hs/hts/HTSTransactionAdapter.js';
// import { HashpackTransactionAdapter } from '../port/out/hs/hashpack/HashpackTransactionAdapter.js';
import { RevokeSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/revokeSupplierRole/RevokeSupplierRoleCommandHandler.js';
import { GrantSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/grantSupplierRole/GrantSupplierRoleCommandHandler.js';
import { GrantUnlimitedSupplierRoleCommandHandler } from '../app/usecase/command/stablecoin/roles/granUnlimitedSupplierRole/GrantUnlimitedSupplierRoleCommandHandler.js';
import { GetReserveAmountQueryHandler } from '../app/usecase/query/stablecoin/getReserveAmount/GetReserveAmountQueryHandler.js';
import { UpdateReserveAddressCommandHandler } from '../app/usecase/command/stablecoin/operations/updateReserveAddress/UpdateReserveAddressCommandHandler.js';
import { UpdateReserveAmountCommandHandler } from '../app/usecase/command/reserve/operations/updateReserveAmount/UpdateReserveAmountCommandHandler.js';
import { BalanceOfQueryHandler } from '../app/usecase/query/stablecoin/balanceof/BalanceOfQueryHandler.js';
import { BalanceOfHBARQueryHandler } from '../app/usecase/query/stablecoin/balanceOfHBAR/BalanceOfHBARQueryHandler.js';
import { GetReserveAddressQueryHandler } from '../app/usecase/query/stablecoin/getReserveAddress/GetReserveAddressQueryHandler.js';
import { IsUnlimitedQueryHandler } from '../app/usecase/query/stablecoin/isUnlimited/IsUnlimitedQueryHandler.js';
import { RevokeKycCommandHandler } from '../app/usecase/command/stablecoin/operations/revokeKyc/RevokeKycCommandHandler.js';
import { GrantKycCommandHandler } from '../app/usecase/command/stablecoin/operations/grantKyc/GrantKycCommandHandler.js';
import { GetAccountTokenRelationshipQueryHandler } from '../app/usecase/query/account/tokenRelationship/GetAccountTokenRelationshipQueryHandler.js';
import { SDK } from '../port/in/Common.js';
import { SetConfigurationCommandHandler } from '../app/usecase/command/network/setConfiguration/SetConfigurationCommandHandler.js';
import { GetTokenManagerListQueryHandler } from '../app/usecase/query/factory/getTokenManagerList/GetTokenManagerListQueryHandler.js';
import { GetAccountsWithRolesQueryHandler } from '../app/usecase/query/stablecoin/roles/getAccountsWithRole/GetAccountsWithRolesQueryHandler.js';
import { GetProxyConfigQueryHandler } from '../app/usecase/query/proxy/GetProxyConfigQueryHandler.js';
import { GetFactoryProxyConfigQueryHandler } from '../app/usecase/query/factoryProxy/GetFactoryProxyConfigQueryHandler.js';
import { BladeTransactionAdapter } from '../port/out/hs/blade/BladeTransactionAdapter.js';
import { FireblocksTransactionAdapter } from '../port/out/hs/hts/custodial/FireblocksTransactionAdapter.js';
import { DFNSTransactionAdapter } from '../port/out/hs/hts/custodial/DFNSTransactionAdapter.js';
import { MultiSigTransactionAdapter } from '../port/out/hs/multiSig/MultiSigTransactionAdapter.js';
import { SignCommandHandler } from '../app/usecase/command/stablecoin/backend/sign/SignCommandHandler.js';
import { SubmitCommandHandler } from '../app/usecase/command/stablecoin/backend/submit/SubmitCommandHandler.js';
import { RemoveCommandHandler } from '../app/usecase/command/stablecoin/backend/remove/RemoveCommandHandler.js';
import { SetBackendCommandHandler } from '../app/usecase/command/network/setBackend/SetBackendCommandHandler.js';
import { GetTransactionsQueryHandler } from '../app/usecase/query/stablecoin/backend/getTransactions/GetTransactionsQueryHandler.js';
import { HederaWalletConnectTransactionAdapter } from '../port/out/hs/walletconnect/HederaWalletConnectTransactionAdapter.js';

export const TOKENS = {
	COMMAND_HANDLER: Symbol('CommandHandler'),
	QUERY_HANDLER: Symbol('QueryHandler'),
	TRANSACTION_HANDLER: 'TransactionHandler',
};

const COMMAND_HANDLERS = [
	// Mock
	/*{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ConcreteCommandHandler,
	},*/
	// Stablecoin Creation
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: CreateCommandHandler,
	},
	// Stablecoin Update
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateCommandHandler,
	},
	// Stablecoin Operations
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
		useClass: TransfersCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: addFixedFeesCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateCustomFeesCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: addFractionalFeesCommandHandler,
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
		useClass: RescueHBARCommandHandler,
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
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: AssociateCommandHandler,
	},
	// Stablecoin Role Operations
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
		useClass: GrantMultiRolesCommandHandler,
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
		useClass: RevokeMultiRolesCommandHandler,
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
		useClass: SetBackendCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: SetConfigurationCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateReserveAddressCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpdateReserveAmountCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpgradeImplementationCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: UpgradeFactoryImplementationCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ChangeOwnerCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: AcceptOwnerCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: ChangeFactoryOwnerCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: AcceptFactoryOwnerCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: SignCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: SubmitCommandHandler,
	},
	{
		token: TOKENS.COMMAND_HANDLER,
		useClass: RemoveCommandHandler,
	},
];

const QUERY_HANDLERS = [
	/*{
		token: TOKENS.QUERY_HANDLER,
		useClass: ConcreteQueryHandler,
	},*/
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
		useClass: BalanceOfQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: BalanceOfHBARQueryHandler,
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
		useClass: GetAccountsWithRolesQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: IsUnlimitedQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetAccountTokenRelationshipQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetTokenManagerListQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetProxyConfigQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetFactoryProxyConfigQueryHandler,
	},
	{
		token: TOKENS.QUERY_HANDLER,
		useClass: GetTransactionsQueryHandler,
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
	/* {
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HashpackTransactionAdapter,
	},*/
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: BladeTransactionAdapter,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: MultiSigTransactionAdapter,
	},
	{
		token: TOKENS.TRANSACTION_HANDLER,
		useClass: HederaWalletConnectTransactionAdapter,
	},
];

const defaultNetworkProps: NetworkProps = {
	environment: 'testnet',
	mirrorNode: {
		name: 'default',
		baseUrl: 'https://testnet.mirrornode.hedera.com',
	},
	rpcNode: {
		name: 'default',
		baseUrl: 'https://testnet.hashio.io/api',
	},
};

// Network default props
container.register<NetworkProps>('NetworkProps', {
	useValue: defaultNetworkProps,
});

// Wallet events
container.register<typeof WalletEvents>('WalletEvents', {
	useValue: WalletEvents,
});

// SDK Logs
container.register<typeof SDK>('SDK', {
	useValue: SDK,
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
			// adapters.push(Injectable.resolve(HashpackTransactionAdapter));
			adapters.push(Injectable.resolve(RPCTransactionAdapter));
			adapters.push(Injectable.resolve(BladeTransactionAdapter));
			adapters.push(Injectable.resolve(FireblocksTransactionAdapter));
			adapters.push(Injectable.resolve(DFNSTransactionAdapter));
			adapters.push(
				Injectable.resolve(HederaWalletConnectTransactionAdapter),
			);
		} else {
			adapters.push(Injectable.resolve(HTSTransactionAdapter));
		}
		adapters.push(Injectable.resolve(MultiSigTransactionAdapter));
		return adapters;
	}

	static isWeb(): boolean {
		return !!global.window;
	}
}
