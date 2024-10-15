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

export const formatDateTime = ({ dateTime, isUTC }: { dateTime?: Date; isUTC?: boolean }) => {
	if (!dateTime) return undefined;
	// By default, the date is formatted in UTC
	isUTC = isUTC ?? true;
	let year, month, day, hour, minute, second;

	if (isUTC) {
		year = dateTime.getUTCFullYear().toString();
		month = (dateTime.getUTCMonth() + 1).toString().padStart(2, '0');
		day = dateTime.getUTCDate().toString().padStart(2, '0');
		hour = dateTime.getUTCHours().toString().padStart(2, '0');
		minute = dateTime.getUTCMinutes().toString().padStart(2, '0');
		second = dateTime.getUTCSeconds().toString().padStart(2, '0');
	} else {
		year = dateTime.getFullYear().toString();
		month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
		day = dateTime.getDate().toString().padStart(2, '0');
		hour = dateTime.getHours().toString().padStart(2, '0');
		minute = dateTime.getMinutes().toString().padStart(2, '0');
		second = dateTime.getSeconds().toString().padStart(2, '0');
	}
	return `${year}-${month}-${day}T${hour}:${minute}:${second}${isUTC ? 'Z' : ''}`;
};
