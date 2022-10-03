import DomainError from '../../../../src/domain/error/DomainError.js';
import { PrivateKey } from '../../../../src/index.js';
import { ACCOUNTS } from '../../../core.js';

describe('🧪 [DOMAIN] PrivateKey', () => {
	it('Instantiate the class', () => {
		const pk = new PrivateKey(ACCOUNTS.testnet.privateKey.key);
		expect(pk).not.toBeNull();
		expect(pk.key).toBe(ACCOUNTS.testnet.privateKey.key);
	});

	it('Expect to fail on invalid private key', () => {
		expect(() => new PrivateKey('invalid private key')).toThrow(
			DomainError,
		);
	});
});
