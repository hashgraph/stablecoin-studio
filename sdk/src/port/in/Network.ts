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

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { InitializationData } from '../out/TransactionAdapter.js';
import { ConnectCommand } from '../../app/usecase/command/network/connect/ConnectCommand.js';
import ConnectRequest, { SupportedWallets } from './request/ConnectRequest.js';
import RequestMapper from './request/mapping/RequestMapper.js';
import TransactionService from '../../app/service/TransactionService.js';
import NetworkService from '../../app/service/NetworkService.js';
import SetNetworkRequest from './request/SetNetworkRequest.js';
import { SetNetworkCommand } from '../../app/usecase/command/network/setNetwork/SetNetworkCommand.js';
import { SetConfigurationCommand } from '../../app/usecase/command/network/setConfiguration/SetConfigurationCommand.js';
import {
	Environment,
	unrecognized,
} from '../../domain/context/network/Environment.js';
import InitializationRequest from './request/InitializationRequest.js';
import Event, { WalletEvents } from './Event.js';
import RPCTransactionAdapter from '../out/rpc/RPCTransactionAdapter.js';
import { HashpackTransactionAdapter } from '../out/hs/hashpack/HashpackTransactionAdapter.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import SetConfigurationRequest from './request/SetConfigurationRequest.js';
import { handleValidation } from './Common.js';
import { MirrorNode } from '../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../domain/context/network/JsonRpcRelay.js';
import { BladeTransactionAdapter } from '../out/hs/blade/BladeTransactionAdapter.js';
import DfnsSettings from 'domain/context/custodialwalletsettings/DfnsSettings.js';

export { InitializationData, SupportedWallets };

export type NetworkResponse = {
	environment: Environment;
	mirrorNode: MirrorNode;
	rpcNode: JsonRpcRelay;
	consensusNodes: string;
};

export type ConfigResponse = {
	factoryAddress: string;
};

interface INetworkInPort {
	connect(req: ConnectRequest): Promise<InitializationData>;
	disconnect(): Promise<boolean>;
	setNetwork(req: SetNetworkRequest): Promise<NetworkResponse>;
	setConfig(req: SetConfigurationRequest): Promise<ConfigResponse>;
	getFactoryAddress(): string;
	getNetwork(): string;
	isNetworkRecognized(): boolean;
}

class NetworkInPort implements INetworkInPort {
	constructor(
		private readonly commandBus: CommandBus = Injectable.resolve(
			CommandBus,
		),
		private readonly transactionService: TransactionService = Injectable.resolve(
			TransactionService,
		),
		private readonly networkService: NetworkService = Injectable.resolve(
			NetworkService,
		),
	) {}

	@LogError
	async setConfig(req: SetConfigurationRequest): Promise<ConfigResponse> {
		handleValidation('SetConfigurationRequest', req);

		const res = await this.commandBus.execute(
			new SetConfigurationCommand(req.factoryAddress),
		);
		return res;
	}

	@LogError
	public getFactoryAddress(): string {
		return this.networkService.configuration
			? this.networkService.configuration.factoryAddress
			: '';
	}

	@LogError
	public getNetwork(): string {
		return this.networkService.environment;
	}

	@LogError
	public isNetworkRecognized(): boolean {
		return this.networkService.environment != unrecognized;
	}

	@LogError
	async setNetwork(req: SetNetworkRequest): Promise<NetworkResponse> {
		handleValidation('SetNetworkRequest', req);

		const res = await this.commandBus.execute(
			new SetNetworkCommand(
				req.environment,
				req.mirrorNode,
				req.rpcNode,
				req.consensusNodes,
			),
		);
		return res;
	}

	@LogError
	async init(req: InitializationRequest): Promise<SupportedWallets[]> {
		handleValidation('InitializationRequest', req);

		await this.setNetwork(
			new SetNetworkRequest({
				environment: req.network,
				mirrorNode: req.mirrorNode,
				rpcNode: req.rpcNode,
			}),
		);

		if (req.configuration)
			if (req.configuration.factoryAddress)
				await this.setConfig(
					new SetConfigurationRequest({
						factoryAddress: req.configuration.factoryAddress,
					}),
				);

		req.events && Event.register(req.events);
		const wallets: SupportedWallets[] = [];
		const instances = Injectable.registerTransactionAdapterInstances();
		for (const val of instances) {
			if (val instanceof RPCTransactionAdapter) {
				wallets.push(SupportedWallets.METAMASK);
			} else if (val instanceof HashpackTransactionAdapter) {
				wallets.push(SupportedWallets.HASHPACK);
			} else if (val instanceof BladeTransactionAdapter) {
				wallets.push(SupportedWallets.BLADE);
			} else {
				wallets.push(SupportedWallets.CLIENT);
			}
			await val.init();

			if (val instanceof RPCTransactionAdapter) {
				val.setMirrorNodes(req.mirrorNodes);
				val.setJsonRpcRelays(req.jsonRpcRelays);
				val.setFactories(req.factories);
			}
		}
		return wallets;
	}

	@LogError
	async connect(req: ConnectRequest): Promise<InitializationData> {
		handleValidation('ConnectRequest', req);

		const account = RequestMapper.mapAccount(req.account);
		if (req.custodialWalletSettings && req.wallet == SupportedWallets.DFNS) {
			// TODO: review syntax
			// req.custodialWalletSettings = req.custodialWalletSettings as unknown as DfnsSettings;
			// new DfnsSettings(req.custodialWalletSettings.serviceAccountPrivateKey,
			// 	req.custodialWalletSettings.serviceAccountCredentialId: string,
			// 	req.custodialWalletSettings.serviceAccountAuthToken: string,
			// 	req.custodialWalletSettings.appOrigin: string,
			// 	req.custodialWalletSettings.appId: string,
			// 	req.custodialWalletSettings.baseUrl: string,
			// 	req.custodialWalletSettings.walletId: string,
			// 	req.custodialWalletSettings.hederaAccountId: HederaId,
			// 	req.custodialWalletSettings.hederaAccountPublicKey: PublicKey,)
		} else if (
			req.custodialWalletSettings &&
			req.wallet == SupportedWallets.FIREBLOCKS
		) {

		}
		if (
			req.wallet == SupportedWallets.HASHPACK ||
			req.wallet == SupportedWallets.BLADE
		) {
			const instances = Injectable.registerTransactionAdapterInstances();
			for (const val of instances) {
				if (
					val instanceof HashpackTransactionAdapter ||
					val instanceof BladeTransactionAdapter
				) {
					await val.restart(req.network);
				}
			}
		}
		await this.commandBus.execute(
			new SetNetworkCommand(req.network, req.mirrorNode, req.rpcNode),
		);

		const res = await this.commandBus.execute(
			new ConnectCommand(
				req.network,
				req.wallet,
				account,
				req.custodialWalletSettings,
			),
		);
		return res.payload;
	}

	disconnect(): Promise<boolean> {
		return this.transactionService.getHandler().stop();
	}
}

const Network = new NetworkInPort();
export default Network;
