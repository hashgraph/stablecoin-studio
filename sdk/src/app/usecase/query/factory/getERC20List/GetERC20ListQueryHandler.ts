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

import { EVM_ZERO_ADDRESS } from '../../../../../core/Constants.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
	GetERC20ListQuery,
	GetERC20ListQueryResponse,
} from './GetERC20ListQuery.js';

@QueryHandler(GetERC20ListQuery)
export class GetERC20ListQueryHandler
	implements IQueryHandler<GetERC20ListQuery>
{
	constructor(
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(
		command: GetERC20ListQuery,
	): Promise<GetERC20ListQueryResponse> {
		const { factoryId } = command;
		const res = await this.queryAdapter.getERC20List(
			factoryId.toEvmAddress(),
		);

		const removeDeletedAddress = res.filter(
			(item) => item !== EVM_ZERO_ADDRESS,
		);
		return Promise.resolve(
			new GetERC20ListQueryResponse(
				removeDeletedAddress.map((item) =>
					ContractId.fromHederaEthereumAddress(item),
				),
			),
		);
	}
}
