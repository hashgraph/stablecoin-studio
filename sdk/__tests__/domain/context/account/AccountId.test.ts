import AccountId from '../../../../src/domain/context/account/AccountId.js';
import DomainError from '../../../../src/domain/error/DomainError.js';
import { ACCOUNTS } from '../../../core.js';

describe('🧪 [DOMAIN] AccountId', () => {
	it('Instantiate the class', () => {
		const account = new AccountId(ACCOUNTS.testnet.accountId.id);
		expect(account).not.toBeNull();
		expect(account.id).toBe(ACCOUNTS.testnet.accountId.id);
	});

	it('Expect to fail on invalid account id', () => {
		expect(() => new AccountId('invalid account id')).toThrow(DomainError);
	});

	it('Empty classs', () => {
		expect(AccountId.NULL.id).toBe('0.0.0');
	});
});
