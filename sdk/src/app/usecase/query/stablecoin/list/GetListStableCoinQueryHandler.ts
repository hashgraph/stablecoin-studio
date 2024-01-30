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

import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator';
import Injectable from '../../../../../core/Injectable';
import { IQueryHandler } from '../../../../../core/query/QueryHandler';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter';
import {
	GetListStableCoinQuery,
	GetListStableCoinQueryResponse,
} from './GetListStableCoinQuery';

@QueryHandler(GetListStableCoinQuery)
export class GetListStableCoinQueryHandler
	implements IQueryHandler<GetListStableCoinQuery>
{
	constructor(
		public readonly repo: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	async execute(
		query: GetListStableCoinQuery,
	): Promise<GetListStableCoinQueryResponse> {
		const list = await this.repo.getStableCoinsList(query.accountId);
		return Promise.resolve(new GetListStableCoinQueryResponse(list));
	}
}
