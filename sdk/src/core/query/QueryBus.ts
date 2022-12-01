/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'tsyringe';
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from '../Constants.js';
import { QueryMetadata } from '../decorator/QueryMetadata.js';
import { Injectable } from '../Injectable.js';
import { Type } from '../Type.js';
import { Query } from './Query.js';
import { IQueryHandler } from './QueryHandler.js';
import { QueryResponse } from './QueryResponse.js';
import { QueryHandlerNotFoundException } from './error/QueryHandlerNotFoundException.js';
import { InvalidQueryHandlerException } from './error/InvalidQueryHandlerException.js';

export type QueryHandlerType = IQueryHandler<Query<QueryResponse>>;

export interface IQueryBus<T extends QueryResponse> {
	execute<X extends T>(query: Query<X>): Promise<X>;
	bind<X extends T>(handler: IQueryHandler<Query<X>>, id: string): void;
}

@injectable()
export class QueryBus<T extends QueryResponse = QueryResponse> implements IQueryBus<T> {
	public handlers = new Map<string, IQueryHandler<Query<T>>>();

	constructor() {
		const handlers = Injectable.getQueryHandlers();
		this.registerHandlers(handlers);
	}

	execute<X extends T>(query: Query<X>): Promise<X> {
		try {
			const queryId = this.getQueryId(query);
			const handler = this.handlers.get(queryId);
			if (!handler) {
				throw new QueryHandlerNotFoundException(queryId);
			}
			return handler.execute(query) as Promise<X>;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	bind<X extends T>(handler: IQueryHandler<Query<X>>, id: string): void {
		this.handlers.set(id, handler);
	}

	private getQueryId<X>(query: Query<X>): string {
		const { constructor: queryType } = Object.getPrototypeOf(query);
		const queryMetadata: QueryMetadata = Reflect.getMetadata(
			QUERY_METADATA,
			queryType,
		);
		if (!queryMetadata) {
			throw new QueryHandlerNotFoundException(queryType.name);
		}
		return queryMetadata.id;
	}

	protected registerHandlers(handlers: QueryHandlerType[]): void {
		handlers.forEach((handler) => {
			const target = this.reflectQueryId(handler);
			if (!target) {
				throw new InvalidQueryHandlerException();
			}
			this.bind(handler as IQueryHandler<Query<T>>, target);
		});
	}

	private reflectQueryId(handler: QueryHandlerType): string | undefined {
		const { constructor: handlerType } = Object.getPrototypeOf(handler);
		const query: Type<Query<QueryResponse>> = Reflect.getMetadata(
			QUERY_HANDLER_METADATA,
			handlerType,
		);
		const queryMetadata: QueryMetadata = Reflect.getMetadata(
			QUERY_METADATA,
			query,
		);
		return queryMetadata.id;
	}
}
