import { Constructor } from '../Type.js';
import { inject, delay } from 'tsyringe';

/**
 * This decorator substitutes the lazy loading construct from tsyringe
 *
 * @param cls Class to lazy load
 */
export function lazyInject<T>(token: Constructor<T>): unknown {
	return (
		target: unknown,
		propertyKey: string | symbol,
		parameterIndex: number,
	) => {
		inject(delay(() => token))(target, propertyKey, parameterIndex);
	};
}
