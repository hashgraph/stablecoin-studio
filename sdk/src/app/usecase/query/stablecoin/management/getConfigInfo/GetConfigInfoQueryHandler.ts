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

import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import {
	GetConfigInfoQuery,
	GetConfigInfoQueryResponse,
} from './GetConfigInfoQuery.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { DiamondConfiguration } from '../../../../../../domain/context/diamond/DiamondConfiguration.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';

@QueryHandler(GetConfigInfoQuery)
export class GetConfigInfoQueryHandler
	implements IQueryHandler<GetConfigInfoQuery>
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
		query: GetConfigInfoQuery,
	): Promise<GetConfigInfoQueryResponse> {
		const { tokenId } = query;
		const coin = await this.stableCoinService.get(tokenId);
		if (!coin.evmProxyAddress) throw new Error('Invalid token id');

		const [resolverAddress, configId, configVersion] =
			await this.queryAdapter.getConfigInfo(coin.evmProxyAddress);

		const resolverId = (
			await this.mirrorNode.getContractInfo(resolverAddress)
		).id;

		return Promise.resolve(
			new GetConfigInfoQueryResponse(
				new DiamondConfiguration(resolverId, configId, configVersion),
			),
		);
	}
}
