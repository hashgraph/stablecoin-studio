import { validateAccount } from "../validationsHelper";

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
})