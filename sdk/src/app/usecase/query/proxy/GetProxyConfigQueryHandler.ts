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
import { ContractId as HContractId } from '@hashgraph/sdk';
import {
	GetProxyConfigQuery,
	GetProxyConfigQueryResponse,
} from './GetProxyConfigQuery.js';
import { MirrorNodeAdapter } from '../../../../port/out/mirror/MirrorNodeAdapter.js';
import { EVM_ZERO_ADDRESS } from '../../../../core/Constants.js';

@QueryHandler(GetProxyConfigQuery)
export class GetProxyConfigQueryHandler
	implements IQueryHandler<GetProxyConfigQuery>
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
		command: GetProxyConfigQuery,
	): Promise<GetProxyConfigQueryResponse> {
		const { tokenId } = command;

		const coin = await this.stableCoinService.get(tokenId);

		if (!coin.proxyAddress || !coin.evmProxyAddress)
			throw new Error('No proxy Address found');

		if (!coin.proxyAdminAddress || !coin.evmProxyAdminAddress)
			throw new Error('No proxy Admin Address found');
		const proxyImpl = await this.queryAdapter.getProxyImplementation(
			coin.evmProxyAdminAddress,
			coin.evmProxyAddress,
		);
		const proxyOwner = await this.queryAdapter.getProxyOwner(
			coin.evmProxyAdminAddress,
		);
		const proxyPendingOwner = await this.queryAdapter.getProxyPendingOwner(
			coin.evmProxyAdminAddress,
		);

		const proxyOwnerHederaId = HederaId.from(
			(await this.mirrorNode.getAccountInfo(proxyOwner)).id,
		);

		const proxyPendingOwnerHederaId =
			EVM_ZERO_ADDRESS == proxyPendingOwner
				? HederaId.NULL
				: HederaId.from(
						(
							await this.mirrorNode.getAccountInfo(
								proxyPendingOwner,
							)
						).id,
				  );

		return Promise.resolve(
			new GetProxyConfigQueryResponse({
				implementationAddress: ContractId.fromHederaContractId(
					HContractId.fromString(
						(await this.mirrorNode.getContractInfo(proxyImpl)).id,
					),
				),
				owner: proxyOwnerHederaId,
				pendingOwner: proxyPendingOwnerHederaId,
			}),
		);
	}
}
