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

import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import Injectable from '../../../../../core/Injectable.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
	GetAccountTokenAssociatedQuery,
	GetAccountTokenAssociatedQueryResponse,
} from './GetAccountTokenAssociatedQuery.js';

@QueryHandler(GetAccountTokenAssociatedQuery)
export class GetAccountTokenAssociatedQueryHandler
	implements IQueryHandler<GetAccountTokenAssociatedQuery>
{
	constructor(
		public readonly repo: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	async execute(
		query: GetAccountTokenAssociatedQuery,
	): Promise<GetAccountTokenAssociatedQueryResponse> {
		const res = await this.repo.getAccountTokens(
			query.targetId,
			query.tokenId,
		);

		return Promise.resolve(
			new GetAccountTokenAssociatedQueryResponse(res.tokens.length > 0),
		);
	}
}
