export const formatAmount = ({
	amount,
	decimals,
	language = 'en-EN',
}: {
	amount?: number;
	decimals?: number;
	language?: string;
}) => {
	return amount?.toLocaleString(language, {
		maximumFractionDigits: decimals ?? 0,
	});
};

export const formatAmountWithDecimals = ({
	amount,
	decimals,
	language = 'en-EN',
}: {
	amount: string;
	decimals: number;
	language?: string;
}) => {
	return Number(Number(amount).toFixed(decimals)).toLocaleString(language, {
		maximumFractionDigits: decimals,
	});
};

export const formatShortKey = ({ key }: { key: string }) => {
	if (key) {
		console.log(key.slice(0, 6) + '...' + key.slice(key.length - 6, key.length));
		return key.slice(0, 6) + '...' + key.slice(key.length - 6, key.length);
	}
};
