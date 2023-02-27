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

import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';

export class GetERC20ByIndexQueryResponse implements QueryResponse {
	constructor(public readonly payload: ContractId) {}
}

export class GetERC20ByIndexQuery extends Query<GetERC20ByIndexQueryResponse> {
	constructor(
		public readonly factoryId: ContractId,
		public readonly index: number,
	) {
		super();
	}
}
