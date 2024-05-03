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
		return key.slice(0, 6) + '...' + key.slice(key.length - 6, key.length);
	}
};

export const formatDateTime = ({ dateTime }: { dateTime?: Date }) => {
	if (!dateTime) return undefined;

	let month = (dateTime.getUTCMonth() + 1).toString();
	if (month.length < 2) month = '0' + month;

	let day = dateTime.getUTCDate().toString();
	if (day.length < 2) day = '0' + day;

	let hour = dateTime.getUTCHours().toString();
	if (hour.length < 2) hour = '0' + hour;

	let minute = dateTime.getUTCMinutes().toString();
	if (minute.length < 2) minute = '0' + minute;

	let second = dateTime.getUTCSeconds().toString();
	if (second.length < 2) second = '0' + second;

	return (
		dateTime.getUTCFullYear().toString() +
		'-' +
		month +
		'-' +
		day +
		'T' +
		hour +
		':' +
		minute +
		':' +
		second +
		'Z'
	);
};
