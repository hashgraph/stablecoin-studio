import BaseError from '../../../../core/error/BaseError.js';
import { BaseRequest } from '../BaseRequest.js';

export type ValidatedRequestKey<T extends BaseRequest> = keyof Omit<
	T,
	'validations' | 'validate'
>;

export type ValidationFn<K> = (val: K) => BaseError[] | void;
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type ValidationSchema<T extends BaseRequest> = Partial<{
	[K in ValidatedRequestKey<T>]: ValidationFn<PropType<T, K>>;
}>;
