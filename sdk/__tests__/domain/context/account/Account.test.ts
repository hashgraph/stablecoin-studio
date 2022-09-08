import Account from '../../../../src/domain/context/account/Account.js';
import { AccountId } from '../../../../src/domain/context/account/AccountId.js';
import { AccountIdNotValid } from '../../../../src/domain/context/account/error/AccountIdNotValid.js';
import { PrivateKeyNotValid } from '../../../../src/domain/context/account/error/PrivateKeyNotValid.js';
import { PrivateKey } from '../../../../src/domain/context/account/PrivateKey.js';
import DomainError from '../../../../src/domain/error/DomainError.js';
import { ACCOUNTS, getSDK } from '../../../core.js';

describe('🧪 [DOMAIN] Account', () => {
	let sdk;

	beforeEach(async () => {
		sdk = await getSDK();
	});

	it('Instantiate the class', () => {
		const account = new Account(
			ACCOUNTS.testnet.accountId,
			ACCOUNTS.testnet.privateKey,
		);
		expect(account).not.toBeNull();
	});

	it('Create an instance with all properties', () => {
		const account = new Account(
			ACCOUNTS.testnet.accountId,
			ACCOUNTS.testnet.privateKey,
		);
		expect(account).not.toBeNull();
		expect(account.accountId).toBe(ACCOUNTS.testnet.accountId);
		expect(account.privateKey).toBe(ACCOUNTS.testnet.privateKey);
	});

	it('Expect to fail on invalid account id', () => {
		expect(() => new AccountId('invalid account id')).toThrowError(
			DomainError,
		);
	});

	it('Expect to fail on invalid private key', () => {
		expect(() => new PrivateKey('invalid key')).toThrowError(DomainError);
	});
});
