import { formatAmount, formatAmountWithDecimals, formatShortKey } from '../inputHelper';

describe('Validate account helper work as expected', () => {
	test('10.1 is a valid format for an amount', () => {
		const amount = 10;
		const decimals = 0;
		const result = formatAmount({ amount, decimals });
		expect(result).toEqual('10');
	});

	test('10.1 is a valid format for an amount with decimals', () => {
		const amount = '10.1';
		const decimals = 1;
		const result = formatAmountWithDecimals({ amount, decimals });
		expect(result).toEqual('10.1');
	});

	test('The key abcdefghijklmnopqrstuvwxyz can be obtained in a short format', () => {
		const key = 'abcdefghijklmnopqrstuvwxyz';
		const result = formatShortKey({ key });
		expect(result).toEqual('abcdef...uvwxyz');
	});
});
