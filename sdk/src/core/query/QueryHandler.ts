/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "./Query.js";

export interface QueryHandler<
	TQuery extends Query = any,
	TResult = any,
> {
	execute(query: TQuery): Promise<TResult>;
}
