import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { Injectable } from '../../../../../core/Injectable.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
	GetAccountInfoQuery,
	GetAccountInfoQueryResponse,
} from './GetAccountInfoQuery.js';

@QueryHandler(GetAccountInfoQuery)
export class GetAccountInfoQueryHandler
	implements IQueryHandler<GetAccountInfoQuery>
{
	constructor(
		public readonly repo: MirrorNodeAdapter = Injectable.resolve(
			MirrorNodeAdapter,
		),
	) {}

	async execute(
		query: GetAccountInfoQuery,
	): Promise<GetAccountInfoQueryResponse> {
		const res = await this.repo.getAccountInfo(query.id);
		return Promise.resolve(new GetAccountInfoQueryResponse(res));
	}
}
