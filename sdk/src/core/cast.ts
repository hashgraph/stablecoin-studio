/* eslint-disable @typescript-eslint/no-explicit-any */

import { Constructible } from "./types.js";

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
