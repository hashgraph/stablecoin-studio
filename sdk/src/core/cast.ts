export const safeCast = <TYPE>(val?: TYPE | Partial<TYPE> | undefined): TYPE | undefined => {
	if (!val) return val;
	return val as TYPE;
};
