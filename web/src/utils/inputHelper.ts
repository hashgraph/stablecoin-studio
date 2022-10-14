import { useTranslation } from 'react-i18next';

export const formatAmount = ({ amount, decimals }: { amount?: number; decimals?: number }) => {
	const { i18n } = useTranslation();

	if (typeof amount !== 'number' || Number.isNaN(amount)) return '';

	return amount?.toLocaleString(i18n.language, {
		maximumFractionDigits: decimals ?? 0,
	});
};
