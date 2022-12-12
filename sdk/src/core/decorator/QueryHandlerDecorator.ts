import { QUERY_HANDLER_METADATA, QUERY_METADATA } from '../Constants';
import { v4 } from 'uuid';
import { BaseQuery } from '../query/Query.js';
import { Constructor } from '../Type.js';
import { injectable } from 'tsyringe';

/**
 * This decorator determines that a class is a query handler
 *
 * The decorated class must implement the `QueryHandler` interface.
 *
 * @param query query *type* to be handled by this handler.
 */
export const QueryHandler = (query: BaseQuery): ClassDecorator => {
	return (target: object) => {
		injectable()(target as Constructor<typeof target>);
		if (!Reflect.hasMetadata(QUERY_METADATA, query)) {
			Reflect.defineMetadata(QUERY_METADATA, { id: v4() }, query);
		}
		Reflect.defineMetadata(QUERY_HANDLER_METADATA, query, target);
	};
};
