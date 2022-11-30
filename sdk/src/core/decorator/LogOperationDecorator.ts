import LogService from '../../app/service/log/LogService.js';

const p = performance ? performance : Date;

export const LogOperation = (
	target: unknown,
	propertyKey: string,
	descriptor: PropertyDescriptor,
): PropertyDescriptor => {
	const originalMethod = descriptor.value;
	descriptor.value = function (...args: unknown[]): unknown {
		LogService.logTrace(`Method called: ${propertyKey}`);
		LogService.logTrace('Args: ', args);
		const start = p.now();
		const result = originalMethod.apply(this, args);
		const finish = p.now();
		LogService.logTrace(`Execution time [${propertyKey}]: ${finish - start} milliseconds`);
		return result;
	};

	return descriptor;
};