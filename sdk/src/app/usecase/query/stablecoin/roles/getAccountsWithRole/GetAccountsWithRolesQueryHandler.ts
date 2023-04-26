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

import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import {
	GetAccountsWithRolesQuery,
	GetAccountsWithRolesQueryResponse,
} from './GetAccountsWithRolesQuery.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

@QueryHandler(GetAccountsWithRolesQuery)
export class GetAccountsWithRolesQueryHandler
	implements IQueryHandler<GetAccountsWithRolesQuery>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(
		query: GetAccountsWithRolesQuery,
	): Promise<GetAccountsWithRolesQueryResponse> {
		const listOfAccounts: string[] = [];

		const { roleId, tokenId } = query;

		const coin = await this.stableCoinService.get(HederaId.from(tokenId));
		if (!coin.evmProxyAddress) throw new Error('Invalid token id');

		const res = await this.queryAdapter.getAccountsWithRole(
			coin.evmProxyAddress,
			roleId,
		);

		if (res != undefined && res.length > 0) {
			for (let i = 0; i < res.length; i++) {
				listOfAccounts.push(
					(await this.mirrorNode.getAccountInfo(res[i])).id!,
				);
			}
		}

		return new GetAccountsWithRolesQueryResponse(listOfAccounts);
	}
}
