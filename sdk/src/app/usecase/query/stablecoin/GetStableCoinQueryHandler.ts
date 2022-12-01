import { QueryHandler } from '../../../../core/decorator/QueryHandlerDecorator.js';
import { Injectable } from '../../../../core/Injectable.js';
import { IQueryHandler } from '../../../../core/query/QueryHandler.js';
import MirrorNodeQueryHandler from '../../../../port/out/query/mirror/MirrorNodeQueryHandler.js';
import {
	GetStableCoinQuery,
	GetStableCoinQueryResponse,
} from './GetStableCoinQuery.js';

@QueryHandler(GetStableCoinQuery)
export class GetStableCoinQueryHandler implements IQueryHandler<GetStableCoinQuery> {
	constructor(
		public readonly repo: MirrorNodeQueryHandler = Injectable.resolve(
			MirrorNodeQueryHandler,
		),
	) {}

	async execute(
		query: GetStableCoinQuery,
	): Promise<GetStableCoinQueryResponse> {
		const coin = await this.repo.getStableCoin(query.tokenId);
		return Promise.resolve(new GetStableCoinQueryResponse(coin));
	}
}
