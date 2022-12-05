import { QueryResponse } from "../../../../core/query/QueryResponse.js";

export default interface StableCoinListViewModel extends QueryResponse {
	symbol: string;
	id: string;
}
