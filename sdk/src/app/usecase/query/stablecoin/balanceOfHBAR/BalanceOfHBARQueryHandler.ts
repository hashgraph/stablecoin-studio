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

import { BalanceOfHBARQuery, BalanceOfHBARQueryResponse } from './BalanceOfHBARQuery.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { HBAR_DECIMALS } from '../../../../../core/Constants.js';

@QueryHandler(BalanceOfHBARQuery)
export class BalanceOfHBARQueryHandler implements IQueryHandler<BalanceOfHBARQuery> {
	constructor(
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNode: MirrorNodeAdapter,
	) {}

	async execute(query: BalanceOfHBARQuery): Promise<BalanceOfHBARQueryResponse> {
		const { treasuryAccountId } = query;
		
		const res = await this.mirrorNode.getHBARBalance(treasuryAccountId);

		const treasuryAmount = BigDecimal.fromStringFixed(
			res.toString(),
			HBAR_DECIMALS,
		);
		return new BalanceOfHBARQueryResponse(treasuryAmount);
	}
}
