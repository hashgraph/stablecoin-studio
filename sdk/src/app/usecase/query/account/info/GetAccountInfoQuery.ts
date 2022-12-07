import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { HederaId } from '../../../../../domain/context/shared/HederaId.js';
import AccountViewModel from '../../../../../port/out/mirror/response/AccountViewModel.js';

export class GetAccountInfoQueryResponse implements QueryResponse {
	constructor(public readonly account: AccountViewModel) {}
}

export class GetAccountInfoQuery extends Query<GetAccountInfoQueryResponse> {
	constructor(public readonly id: HederaId) {
		super();
	}
}
