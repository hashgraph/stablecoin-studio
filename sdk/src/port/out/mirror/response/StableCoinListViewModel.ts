import { QueryResponse } from '../../../../core/query/QueryResponse.js';

export default interface StableCoinListViewModel extends QueryResponse {
	coins: { symbol: string; id: string }[];
}
