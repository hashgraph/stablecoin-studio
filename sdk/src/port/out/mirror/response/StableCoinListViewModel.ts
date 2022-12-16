import { constructor } from '@hashgraph/sdk/lib/EntityIdHelper.js';
import { QueryResponse } from '../../../../core/query/QueryResponse.js';

export default interface StableCoinListViewModel extends QueryResponse {
	coins: { symbol: string; id: string }[];

}
