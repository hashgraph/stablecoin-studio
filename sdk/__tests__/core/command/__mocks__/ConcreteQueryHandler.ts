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
export class ConcreteQueryHandler
	implements IQueryHandler<ConcreteQuery>
{
	constructor(
		public readonly repo: ConcreteQueryRepository = new ConcreteQueryRepository(),
	) {}

	execute(query: ConcreteQuery): Promise<ConcreteQueryResponse> {
		this.repo.map.set(query, 'Hello world');
		return Promise.resolve(new ConcreteQueryResponse(query.payload));
	}
}
