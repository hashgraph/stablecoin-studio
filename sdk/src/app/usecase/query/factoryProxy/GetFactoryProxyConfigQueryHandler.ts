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

import ContractId from '../../../../domain/context/contract/ContractId.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../core/query/QueryHandler.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { RPCQueryAdapter } from '../../../../port/out/rpc/RPCQueryAdapter.js';
import StableCoinService from '../../../service/StableCoinService.js';
import {
	GetFactoryProxyConfigQuery,
	GetFactoryProxyConfigQueryResponse,
} from './GetFactoryProxyConfigQuery.js';
import { MirrorNodeAdapter } from '../../../../port/out/mirror/MirrorNodeAdapter.js';
import EvmAddress from '../../../../domain/context/contract/EvmAddress.js';
import { EVM_ZERO_ADDRESS } from '../../../../core/Constants.js';

@QueryHandler(GetFactoryProxyConfigQuery)
export class GetFactoryProxyConfigQueryHandler
	implements IQueryHandler<GetFactoryProxyConfigQuery>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
	) {}

	async execute(
		command: GetFactoryProxyConfigQuery,
	): Promise<GetFactoryProxyConfigQueryResponse> {
		const { factoryProxyId } = command;

		return Promise.resolve(
			new GetFactoryProxyConfigQueryResponse({
				implementationAddress: new ContractId('0.0.0'),
				owner: HederaId.NULL,
				pendingOwner: HederaId.NULL,
			}),
		);

		/*const evmFactoryProxyAdminAddress: string =
			await this.mirrorNode.getContractMemo(factoryProxyId);

		if (!evmFactoryProxyAdminAddress)
			throw new Error(
				"No admin address found for the current factory's proxy",
			);

		const factoryProxyIdContractInfo =
			await this.mirrorNode.getContractInfo(factoryProxyId.toString());

		if (!factoryProxyIdContractInfo)
			throw new Error("No address found for the current factory's proxy");

		const factoryProxyImpl = await this.queryAdapter.getProxyImplementation(
			new EvmAddress(evmFactoryProxyAdminAddress),
			new EvmAddress(factoryProxyIdContractInfo.evmAddress),
		);
		const factoryProxyOwner = await this.queryAdapter.getProxyOwner(
			new EvmAddress(evmFactoryProxyAdminAddress),
		);
		const factoryProxyPendingOwner =
			await this.queryAdapter.getProxyPendingOwner(
				new EvmAddress(evmFactoryProxyAdminAddress),
			);

		const factoryProxyOwnerHederaId = HederaId.from(
			(await this.mirrorNode.getAccountInfo(factoryProxyOwner)).id,
		);

		const factoryProxyPendingOwnerHederaId =
			EVM_ZERO_ADDRESS == factoryProxyPendingOwner
				? HederaId.NULL
				: HederaId.from(
						(
							await this.mirrorNode.getAccountInfo(
								factoryProxyPendingOwner,
							)
						).id,
				  );

		return Promise.resolve(
			new GetFactoryProxyConfigQueryResponse({
				implementationAddress: ContractId.fromHederaEthereumAddress(
					factoryProxyImpl ?? '0.0.0',
				),
				owner: factoryProxyOwnerHederaId,
				pendingOwner: factoryProxyPendingOwnerHederaId,
			}),
		);*/
	}
}
