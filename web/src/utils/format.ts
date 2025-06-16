export function formatBytes32(val: string, chars: number = 4): string {
	if (typeof val !== 'string') return '';

	if (!val.startsWith('0x') || val.length < 2 * chars + 2) {
		return val;
	}

	const start = val.slice(0, 2 + chars);
	const end = val.slice(-chars);

	return `${start}...${end}`;
}
