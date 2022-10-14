import { ContractId } from '../../../../../src/index.js';
import DomainError from '../../../../../src/domain/error/DomainError.js';

describe('🧪 [DOMAIN] InvalidKeyForContractIdDomainError', () => {
  it('Throw exception', () => {
    expect(() => ContractId.fromProtoBufKey('asdf', { strict: true })).toThrow(
      DomainError,
    );
  });
});
