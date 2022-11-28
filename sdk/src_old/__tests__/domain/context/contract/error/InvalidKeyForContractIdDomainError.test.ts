import { ContractId } from '../../../../../src_old/index.js.js';
import DomainError from '../../../../../src_old/core/error/BaseError.js.js';

describe('🧪 [DOMAIN] InvalidKeyForContractIdDomainError', () => {
  it('Throw exception', () => {
    expect(() => ContractId.fromProtoBufKey('asdf', { strict: true })).toThrow(
      DomainError,
    );
  });
});
