import type { ValidationResponse } from 'hedera-stable-coin-sdk';

export const validateAccount = (account: string) => {
	const regex = /^(0)\.(0)\.(0|(?:[1-9]\d*))$/;

	return !!account.match(regex);
};

export const validateDecimals = (value: number, decimals: number) => {
	const decimalsValue = (value + '').split('.')[1];
	const dec = decimalsValue ? decimalsValue.length : 0;
	return dec <= decimals;
};

export const validateDecimalsString = (value: string, decimals: number) => {
	if (value.split('.').length === 1) return true;
	return value.split('.')[1].length <= decimals || false;
};

export const handleRequestValidation = (
	val: ValidationResponse[],
	msg?: string,
): string | boolean => {
	if (val.length > 0) {
		if (msg) return msg;
		return val.map((v) => v.errors.flatMap((e) => e.message)).join('\n');
	}
	return true;
};
