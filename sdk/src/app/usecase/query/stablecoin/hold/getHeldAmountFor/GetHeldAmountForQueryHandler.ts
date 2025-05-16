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
	GetHeldAmountForQuery,
	GetHeldAmountForQueryResponse,
} from './GetHeldAmountForQuery.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from 'app/service/StableCoinService.js';
import { BigDecimal } from '../../../../../../port/in/StableCoin.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';

@QueryHandler(GetHeldAmountForQuery)
export class GetHeldAmountForQueryHandler
	implements IQueryHandler<GetHeldAmountForQuery>
{
	constructor(
		@lazyInject(StableCoinService)
		private readonly stableCoinService: StableCoinService,
		@lazyInject(RPCQueryAdapter)
		private readonly queryAdapter: RPCQueryAdapter,
		@lazyInject(MirrorNodeAdapter)
		private readonly mirrorNode: MirrorNodeAdapter,
	) {}

	async execute(
		command: GetHeldAmountForQuery,
	): Promise<GetHeldAmountForQueryResponse> {
		const { tokenId, targetId } = command;

		const coin = await this.stableCoinService.get(tokenId);

		if (!coin.evmProxyAddress) throw new Error('Invalid token id');

		const res = await this.queryAdapter.getHeldAmountFor(
			coin.evmProxyAddress,
			await this.mirrorNode.accountToEvmAddress(targetId),
		);

		const amount = BigDecimal.fromStringFixed(
			res.toString(),
			coin.decimals,
		);

		return Promise.resolve(new GetHeldAmountForQueryResponse(amount));
	}
}
