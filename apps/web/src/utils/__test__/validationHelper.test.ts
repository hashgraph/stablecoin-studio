import {
	validateAccount,
	validateAmount,
	validateDecimals,
	validateDecimalsString,
} from '../validationsHelper';

describe('Validate account helper work as expected', () => {
	test('valid account should return true', () => {
		const account = '0.0.1234567';
		const validation = validateAccount(account);
		expect(validation).toEqual(true);
	});

	test('shardId different to 0 should be invalid', () => {
		const account = '1.0.1234567';
		const validation = validateAccount(account);
		expect(validation).toEqual(false);
	});

	test('realmId different to 0 should be invalid', () => {
		const account = '0.1.1234567';
		const validation = validateAccount(account);
		expect(validation).toEqual(false);
	});

	test('account with a character should be invalid', () => {
		const account = '0.0.123456a';
		const validation = validateAccount(account);
		expect(validation).toEqual(false);
	});

	test('a string should be invalid', () => {
		const account = 'abcdefg';
		const validation = validateAccount(account);
		expect(validation).toEqual(false);
	});

	test('100 should be a valid amount', () => {
		const amount = '100';
		const validation = validateAmount(amount);
		expect(validation).toEqual(true);
	});

	test('aa should be an invalid amount', () => {
		const amount = 'aa';
		const validation = validateAmount(amount);
		expect(validation).toEqual(false);
	});

	test('10.1 should be a valid decimal', () => {
		const amount = 101;
		const decimals = 1;
		const validation = validateDecimals(amount, decimals);
		expect(validation).toEqual(true);
	});

	test('10.1 should be a valid decimal string', () => {
		const amount = '101';
		const decimals = 1;
		const validation = validateDecimalsString(amount, decimals);
		expect(validation).toEqual(true);
	});

	test('10.1 should be a valid decimal string', () => {
		const amount = '10.1';
		const decimals = 1;
		const validation = validateDecimalsString(amount, decimals);
		expect(validation).toEqual(true);
	});
});
