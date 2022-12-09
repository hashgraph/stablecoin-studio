import { Query } from '../../../../core/query/Query.js';
import { QueryResponse } from '../../../../core/query/QueryResponse.js';
import Account from '../../../../domain/context/account/Account.js';

export class GetCurrentAccountQueryResponse implements QueryResponse {
	constructor(public readonly account: Account) {}
}

export class GetCurrentAccountQuery extends Query<GetCurrentAccountQueryResponse> {
	constructor() {
		super();
	}
}
