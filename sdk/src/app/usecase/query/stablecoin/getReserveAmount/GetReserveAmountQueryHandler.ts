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

import { lazyInject } from "../../../../../core/decorator/LazyInjectDecorator.js"
import { QueryHandler } from "../../../../../core/decorator/QueryHandlerDecorator.js"
import { IQueryHandler } from "../../../../../core/query/QueryHandler.js"
import { RESERVE_DECIMALS } from "../../../../../domain/context/reserve/Reserve.js"
import BigDecimal from "../../../../../domain/context/shared/BigDecimal.js"
import { MirrorNodeAdapter } from "../../../../../port/out/mirror/MirrorNodeAdapter.js"
import RPCQueryAdapter from "../../../../../port/out/rpc/RPCQueryAdapter.js"
import StableCoinService from "../../../../service/StableCoinService.js"
import { GetReserveAmountQuery, GetReserveAmountQueryResponse } from "./GetReserveAmountQuery.js"

@QueryHandler(GetReserveAmountQuery)
export class GetReserveAmountQueryHandler implements IQueryHandler<GetReserveAmountQuery> {
constructor(
	@lazyInject(StableCoinService)
	public readonly stableCoinService: StableCoinService,
	@lazyInject(MirrorNodeAdapter)
	public readonly mirrorNode: MirrorNodeAdapter,
	@lazyInject(RPCQueryAdapter)
	public readonly queryAdapter: RPCQueryAdapter,
) {}


	async execute(command: GetReserveAmountQuery): Promise<GetReserveAmountQueryResponse> {
		const { tokenId } = command;

		const coin = await this.stableCoinService.get(tokenId);
		
		if (!coin.evmProxyAddress) throw new Error('Invalid token id');

		const res = await this.queryAdapter.getReserveAmount(coin.evmProxyAddress);

		const amount = BigDecimal.fromStringFixed(
			res.toString(),
			RESERVE_DECIMALS,
		);

		return Promise.resolve(
			new GetReserveAmountQueryResponse(amount),
		);
	}
}
