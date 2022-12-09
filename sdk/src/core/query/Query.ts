/* eslint-disable @typescript-eslint/no-empty-interface */
export interface BaseQuery {}
export class Query<T> implements BaseQuery {
	private $resultType!: T;
}