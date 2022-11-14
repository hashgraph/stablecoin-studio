export const validateAccount = (account: string) => {
	const regex = /^(0)\.(0)\.(0|(?:[1-9]\d*))$/;

	return !!account.match(regex);
};

export const validateAmount = (amount: string) => {
	const regex = /^(?!(0\.?0*)$)(\d+|\d+\.\d+?)$/;

	return !!amount.match(regex);
};

export const validateDecimalsString = (value: string, decimals: number) => {
	if (value.split('.').length === 1) return true;
	return value.split('.')[1].length <= decimals || false;
};

export const validateDecimals = (value: number, decimals: number) => {
	const decimalsValue = (value + '').split('.')[1];
	const dec = decimalsValue ? decimalsValue.length : 0;
	return dec <= decimals;
};

export const validateQuantityOverMaxSupply = (
	value: number,
	maxSupply?: bigint,
	totalSupply?: bigint,
) => {
	if (maxSupply === (0 as unknown as bigint)) return true; // case when maxSupply is infinite
	if (totalSupply && maxSupply && totalSupply + (value as unknown as bigint) <= maxSupply)
		return true;
	return false;
};
