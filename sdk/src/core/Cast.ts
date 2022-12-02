/* eslint-disable @typescript-eslint/no-explicit-any */

import { BaseContract } from 'ethers';
import { Constructible } from './Type.js';

export const safeCast = <TYPE>(
	val?: TYPE | Partial<TYPE> | undefined,
): TYPE | undefined => {
	if (!val) return val;
	return val as TYPE;
};

export const isConstructible = (value: any): value is Constructible => {
	try {
		new new Proxy(value, {
			construct(): any {
				return {};
			},
		})();
		return true;
	} catch (err) {
		return false;
	}
};

export type CallableContract<T extends BaseContract = BaseContract> =
	T['functions'];
