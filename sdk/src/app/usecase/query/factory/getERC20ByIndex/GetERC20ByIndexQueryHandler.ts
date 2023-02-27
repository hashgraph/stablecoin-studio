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

import { BigNumber } from 'ethers';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { RESERVE_DECIMALS } from '../../../../../domain/context/reserve/Reserve.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import {
	GetERC20ByIndexQuery,
	GetERC20ByIndexQueryResponse,
} from './GetERC20ByIndexQuery.js';

@QueryHandler(GetERC20ByIndexQuery)
export class GetERC20ByIndexQueryHandler
	implements IQueryHandler<GetERC20ByIndexQuery>
{
	constructor(
		@lazyInject(StableCoinService)
		public readonly stableCoinService: StableCoinService,

		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(
		command: GetERC20ByIndexQuery,
	): Promise<GetERC20ByIndexQueryResponse> {
		const { factoryId, index } = command;
		const res = await this.queryAdapter.getERC20(
			factoryId.toEvmAddress(),
			BigNumber.from(index),
		);
		return Promise.resolve(
			new GetERC20ByIndexQueryResponse(new EvmAddress(res)),
		);
	}
}
