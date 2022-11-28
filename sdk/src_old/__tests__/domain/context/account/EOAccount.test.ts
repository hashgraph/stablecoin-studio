import EOAccount from '../../../../src_old/domain/context/account/EOAccount.js.js';
import PrivateKey from '../../../../src_old/domain/context/account/PrivateKey.js.js';
import DomainError from '../../../../src_old/core/error/BaseError.js.js';
import { ACCOUNTS } from '../../../core/core.js';

describe('🧪 [DOMAIN] EOAccount', () => {
  it('Instantiate the class', () => {
    const account = new EOAccount(
      ACCOUNTS.testnet.accountId.id,
      ACCOUNTS.testnet.privateKey,
    );
    expect(account).not.toBeNull();
  });

  it('Create an instance with all properties', () => {
    const account = new EOAccount(
      ACCOUNTS.testnet.accountId.id,
      ACCOUNTS.testnet.privateKey,
    );
    expect(account).not.toBeNull();
    expect(account.accountId).toStrictEqual(ACCOUNTS.testnet.accountId);
    expect(account.privateKey).toStrictEqual(ACCOUNTS.testnet.privateKey);
  });

  it('Expect to fail on invalid private key', () => {
    expect(
      () => new PrivateKey('invalid key', ACCOUNTS.testnet.privateKey.type),
    ).toThrow(DomainError);
  });

  it('Expect to fail on invalid private key type', () => {
    expect(
      () => new PrivateKey(ACCOUNTS.testnet.privateKey.key, 'invalid type'),
    ).toThrow(DomainError);
  });
});
