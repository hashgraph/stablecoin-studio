import { useTranslation } from 'react-i18next';

export const formatAmount = ({ amount, decimals }: { amount?: number; decimals?: number }) => {
	const { i18n } = useTranslation();

	if (typeof amount !== 'number' || Number.isNaN(amount)) return '';

	return amount?.toLocaleString(i18n.language, {
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

export const formatShortKey = ({ key }: { key: string }) => {
	if (key) {
		return key.slice(0, 6) + '...' + key.slice(key.length - 6, key.length);
	}
};
