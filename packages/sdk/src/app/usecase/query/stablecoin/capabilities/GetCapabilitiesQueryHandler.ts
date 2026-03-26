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

import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import StableCoinService from '../../../../service/StableCoinService.js';
import {
	GetCapabilitiesQuery,
	GetCapabilitiesQueryResponse,
} from './GetCapabilitiesQuery.js';

@QueryHandler(GetCapabilitiesQuery)
export class GetCapabilitiesQueryHandler
	implements IQueryHandler<GetCapabilitiesQuery>
{
	constructor(
		@lazyInject(StableCoinService)
		private readonly stableCoinService: StableCoinService,
	) {}

	async execute(
		query: GetCapabilitiesQuery,
	): Promise<GetCapabilitiesQueryResponse> {
		const capabilities = await this.stableCoinService.getCapabilities(
			query.account,
			query.tokenId,
			query.tokenIsPaused,
			query.tokenIsDeleted,
		);
		return new GetCapabilitiesQueryResponse(capabilities);
	}
}
