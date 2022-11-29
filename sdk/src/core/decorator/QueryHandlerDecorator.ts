import 'reflect-metadata';
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from '../Constants';
import { v4 } from 'uuid';
import { IQuery } from '../query/Query.js';

/**
 * This decorator determines that a class is a query handler
 *
 * The decorated class must implement the `QueryHandler` interface.
 *
 * @param query query *type* to be handled by this handler.
 */
export const QueryHandler = (query: IQuery): ClassDecorator => {
	return (target: object) => {
		if (!Reflect.hasMetadata(QUERY_METADATA, query)) {
			Reflect.defineMetadata(QUERY_METADATA, { id: v4() }, query);
		}
		Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
	};
};
