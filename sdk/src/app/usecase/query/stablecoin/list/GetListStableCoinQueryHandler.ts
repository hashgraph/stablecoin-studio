import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
	GetListStableCoinQuery,
	GetListStableCoinQueryResponse,
} from './GetListStableCoinQuery.js';

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
