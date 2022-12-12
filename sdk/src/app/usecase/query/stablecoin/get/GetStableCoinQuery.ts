import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import StableCoinViewModel from '../../../../../port/out/mirror/response/StableCoinViewModel.js';

export class GetStableCoinQueryResponse implements QueryResponse {
	constructor(public readonly coin: StableCoinViewModel) {}
}

export class GetStableCoinQuery extends Query<GetStableCoinQueryResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
