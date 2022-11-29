/* eslint-disable @typescript-eslint/no-empty-interface */
export interface IQuery {}
export class Query<T> implements IQuery {
	private $resultType!: T;
}