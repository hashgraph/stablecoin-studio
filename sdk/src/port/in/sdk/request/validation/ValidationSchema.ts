import BaseError from '../../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';

export type ValidatedRequestKey<T extends BaseRequest> = keyof Omit<
	T,
	'validations' | 'validate'
>;

export type ValidationFn = (val: unknown) => BaseError[] | void;

export type ValidationSchema<T extends BaseRequest> = Partial<{
	[K in ValidatedRequestKey<T>]: ValidationFn;
}>;
