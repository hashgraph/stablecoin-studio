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
import { GetRolesQuery, GetRolesQueryResponse } from './GetRolesQuery.js';
import { AbstractRPCQueryAdapter } from '../../../../../../port/out/rpc/AbstractRPCQueryAdapter.js';
import { AbstractMirrorNodeAdapter } from '../../../../../../port/out/mirror/AbstractMirrorNodeAdapter.js';

@QueryHandler(GetRolesQuery)
export class GetRolesQueryHandler implements IQueryHandler<GetRolesQuery> {
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(AbstractMirrorNodeAdapter)
		public readonly mirrorNode: AbstractMirrorNodeAdapter,
		@lazyInject(AbstractRPCQueryAdapter)
		public readonly queryAdapter: AbstractRPCQueryAdapter,
	) {}

	async execute(query: GetRolesQuery): Promise<GetRolesQueryResponse> {
		const { targetId, tokenId } = query;
		const coin = await this.stableCoinService.get(tokenId);
		if (!coin.evmProxyAddress) throw new Error('Invalid token id');

		const res = await this.queryAdapter.getRoles(
			coin.evmProxyAddress,
			await this.mirrorNode.accountToEvmAddress(targetId),
		);

		return new GetRolesQueryResponse(res);
	}
}
