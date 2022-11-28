/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}
