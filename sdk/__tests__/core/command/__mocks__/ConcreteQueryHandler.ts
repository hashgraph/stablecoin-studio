/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryHandler as IQueryHandler } from '../../../../src/core/query/QueryHandler.js';
import { QueryHandler } from '../../../../src/core/decorator/QueryHandlerDecorator.js';

export class ConcreteQuery {
	constructor(
		public readonly itemId: string,
		public readonly payload: number,
	) {}
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

	execute(query: ConcreteQuery): Promise<any> {
		this.repo.map.set(query, 'Hello world');
		return Promise.resolve(true);
	}
}
