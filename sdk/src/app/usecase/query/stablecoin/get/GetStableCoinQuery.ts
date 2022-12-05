import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import { StableCoin } from '../../../../../domain/context/stablecoin/StableCoin.js';

export class GetStableCoinQueryResponse implements QueryResponse {
	constructor(public readonly coin: StableCoin) {}
}

export class GetStableCoinQuery extends Query<GetStableCoinQueryResponse> {
	constructor(public readonly tokenId: HederaId) {
		super();
	}
}
