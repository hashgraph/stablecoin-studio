import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import StableCoinListViewModel from '../../../../../port/out/mirror/response/StableCoinListViewModel.js';

export class GetListStableCoinQueryResponse implements QueryResponse {
	constructor(public readonly payload: StableCoinListViewModel[]) {}
}

export class GetListStableCoinQuery extends Query<GetListStableCoinQueryResponse> {
	constructor(public readonly accountId: HederaId) {
		super();
	}
}
