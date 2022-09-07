/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
	T,
	Exclude<keyof T, Keys>
> &
	{
		[K in Keys]-?: Required<Pick<T, K>> &
			Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

export abstract class ValueObject<T> {
    constructor(protected props: T) {
        const baseProps: any = {
            ...props,
        };

        this.props = baseProps;
    }

    public equals(vo?: ValueObject<T>): boolean {
        if (vo === null || vo === undefined) {
            return false;
        }
        if (vo.props === undefined) {
            return false;
        }
        return JSON.stringify(this.props) === JSON.stringify(vo.props);
    }
}