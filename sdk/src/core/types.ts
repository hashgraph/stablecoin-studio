/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> &
			Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class ValueObject {
	public abstract toString(): string;
}
