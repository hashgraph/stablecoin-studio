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

import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RESERVE_DECIMALS } from '../../../../../../domain/context/reserve/Reserve.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { BackendAdapter } from '../../../../../../port/out/backend/BackendAdapter.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import MultiSigTransactionViewModel from '../../../../../../port/out/mirror/response/MultiSigTransactionViewModel.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import StableCoinService from '../../../../../service/StableCoinService.js';
import {
	GetTransactionsQuery,
	GetTransactionsQueryResponse,
} from './GetTransactionsQuery.js';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsQueryHandler
	implements IQueryHandler<GetTransactionsQuery>
{
	constructor(
		@lazyInject(BackendAdapter)
		public readonly backendAdapter: BackendAdapter,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
		@lazyInject(RPCQueryAdapter)
		public readonly queryAdapter: RPCQueryAdapter,
	) {}

	async execute(
		command: GetTransactionsQuery,
	): Promise<GetTransactionsQueryResponse> {
		const { publicKey, page, limit, status } = command;

		const res = await this.backendAdapter.getTransactions(
			publicKey,
			page,
			limit,
			status,
		);

		const returnValue: MultiSigTransactionViewModel[] = res.map(
			(trans) => ({ ...trans }),
		);

		return Promise.resolve(new GetTransactionsQueryResponse(returnValue));
	}
}
