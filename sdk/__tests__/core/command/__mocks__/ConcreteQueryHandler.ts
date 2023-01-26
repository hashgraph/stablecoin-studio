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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from '../../../../src/core/query/Query.js';
import { IQueryHandler } from '../../../../src/core/query/QueryHandler.js';
import { QueryResponse } from '../../../../src/core/query/QueryResponse.js';
import { QueryHandler } from '../../../../src/core/decorator/QueryHandlerDecorator.js';

export class ConcreteQueryResponse implements QueryResponse {
	constructor(public readonly payload: number) {}
}

export class ConcreteQuery extends Query<ConcreteQueryResponse> {
	constructor(
		public readonly itemId: string,
		public readonly payload: number,
	) {
		super();
	}
}

export class ConcreteQueryRepository {
	public map = new Map<ConcreteQuery, any>();
}

@QueryHandler(ConcreteQuery)
export class ConcreteQueryHandler implements IQueryHandler<ConcreteQuery> {
	constructor(
		public readonly repo: ConcreteQueryRepository = new ConcreteQueryRepository(),
	) {}

	execute(query: ConcreteQuery): Promise<ConcreteQueryResponse> {
		this.repo.map.set(query, 'Hello world');
		return Promise.resolve(new ConcreteQueryResponse(query.payload));
	}
}
