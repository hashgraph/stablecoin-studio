/* eslint-disable @typescript-eslint/no-explicit-any */
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from '../Constants.js';
import { QueryMetadata } from '../decorator/QueryMetadata.js';
import { Injectable } from '../Injectable.js';
import { Type } from '../Type.js';
import { Query } from './Query.js';
import { QueryHandler } from './QueryHandler.js';
import { QueryHandlerNotFoundException } from './error/QueryHandlerNotFoundException.js';
import { InvalidQueryHandlerException } from './error/InvalidQueryHandlerException.js';

export type QueryHandlerType = Type<QueryHandler<Query>>;
export type QueryBase = Query;

export interface QueryBus<QueryBase extends Query = Query> {
	execute<T extends QueryBase, R = any>(query: T): Promise<R>;
}

export class QueryBus<QueryBase extends Query = Query>
	implements QueryBus<QueryBase>
{
	public handlers = new Map<string, QueryHandler<QueryBase>>();

	constructor(handlers: QueryHandlerType[]) {
		this.registerHandlers(handlers);
	}

	execute<T extends QueryBase, R = any>(query: T): Promise<R> {
		try {
			const queryId = this.getQueryId(query);
			const handler = this.handlers.get(queryId);
			if (!handler) {
				throw new QueryHandlerNotFoundException(queryId);
			}
			return handler.execute(query);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	bind<T extends QueryBase>(handler: QueryHandler<T>, id: string): void {
		this.handlers.set(id, handler);
	}

	private getQueryId(query: QueryBase): string {
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
			const instance = Injectable.getQueryHandler(handler);
			if (!instance) {
				return;
			}
			const target = this.reflectQueryId(handler);
			if (!target) {
				throw new InvalidQueryHandlerException();
			}
			this.bind(instance, target);
		});
	}

	private reflectQueryId(handler: QueryHandlerType): string | undefined {
		const query: Type<Query> = Reflect.getMetadata(
			QUERY_HANDLER_METADATA,
			handler,
		);
		const queryMetadata: QueryMetadata = Reflect.getMetadata(
			QUERY_METADATA,
			query,
		);
		return queryMetadata.id;
	}
}
