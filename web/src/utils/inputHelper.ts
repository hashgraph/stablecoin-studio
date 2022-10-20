export const formatAmount = ({
	amount,
	decimals,
	language = 'en-EN',
}: {
	amount?: number;
	decimals?: number;
	language?: string;
}) => {
	if (typeof amount !== 'number' || Number.isNaN(amount)) return '';

	return amount?.toLocaleString(language, {
		maximumFractionDigits: decimals ?? 0,
	});
};

export const formatAmountWithDecimals = ({
	amount,
	decimals,
	language = 'en-EN',
}: {
	amount: number;
	decimals: number;
	language?: string;
}) => {
	return Number((amount / 10 ** decimals).toFixed(decimals)).toLocaleString(language, {
		maximumFractionDigits: decimals,
	});
};
