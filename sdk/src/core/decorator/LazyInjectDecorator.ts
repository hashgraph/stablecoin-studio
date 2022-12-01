import { Constructor } from '../Type.js';
import { inject, delay } from 'tsyringe';

/**
 * This decorator substitutes the lazy loading construct from tsyringe
 *
 * @param cls Class to lazy load
 */
export function lazyInject<T>(token: Constructor<T>): any {
	return (
		target: any,
		propertyKey: string | symbol,
		parameterIndex: number,
	) => {
		const p = propertyKey;
		inject(delay(() => token))(target, propertyKey, parameterIndex);
	};
}
