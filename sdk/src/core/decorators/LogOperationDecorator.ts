import 'reflect-metadata';
import LogService from '../../app/service/log/LogService.js';

export const LogOperation = (
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
): PropertyDescriptor => {
	const originalMethod = descriptor.value;
	descriptor.value = function (...args: unknown[]): unknown {
		LogService.logTrace(`Method called: ${propertyKey}`);
		LogService.logTrace('Args: ', args);
		const start = Date.now();
		const result = originalMethod.apply(this, args);
		const finish = Date.now();
		LogService.logTrace(`Execution time [${propertyKey}]: ${finish - start} milliseconds`);
		return result;
	};

	return descriptor;
};