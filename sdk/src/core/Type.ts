/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Type<T = any> extends Function {
	new (...args: any[]): T;
}

export interface IndexableObject {
	[n: string | number | symbol]: any;
}

export type Constructible<
	Params extends readonly any[] = any[],
	T = any,
> = new (...params: Params) => T;

export type MapFunction<T, K, O> = (value: T, object: O) => K;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> &
			Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

export type Constructor<T> = {
	new (...args: any[]): T;
};
