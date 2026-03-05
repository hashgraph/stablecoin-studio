import _formatDate from 'date-fns/format';

export const toDate = (date: string | Date = new Date()) =>
	date instanceof Date ? date : new Date(date);

export const formatDate = (
	date?: string | Date | number,
	format = 'dd/MM/yyyy',
	defaultValue = '',
) => {
	if (!date) return defaultValue;

	if (typeof date === 'number') return _formatDate(date, format);

	return _formatDate(toDate(date), format);
};

export function formatBytes32(val: string, chars: number = 4): string {
	if (typeof val !== 'string') return '';

	if (!val.startsWith('0x') || val.length < 2 * chars + 2) {
		return val;
	}

	const start = val.slice(0, 2 + chars);
	const end = val.slice(-chars);

	return `${start}...${end}`;
}
