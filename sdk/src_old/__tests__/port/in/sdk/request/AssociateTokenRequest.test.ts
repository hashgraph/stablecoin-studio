import BaseError, {
  ErrorCode,
} from '../../../../../src_old/core/error/BaseError.js.js';
import { AssociateTokenRequest } from '../../../../../src_old/index.js.js';

import { logValidation, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK AssociateTokenRequest', () => {
  it('Create simple request', () => {
    const request: AssociateTokenRequest = new AssociateTokenRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
      proxyContractId: '0.0.48655608',
    });
    expect(request).not.toBeNull();
  });

  it('AssociateTokenRequest and validate', () => {
    const request: AssociateTokenRequest = new AssociateTokenRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
      proxyContractId: '0.0.48655608',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request [proxyContractId]', () => {
    const request: AssociateTokenRequest = new AssociateTokenRequest({
      account: {
        accountId: 'TEST',
      },
      proxyContractId: '0.0.48655608',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.AccountIdInValid);
  });

  it('Create and validate simple invalid request [accountId, proxyContractId]', () => {
    const request: AssociateTokenRequest = new AssociateTokenRequest({
      account: {
        accountId: 'TEST',
      },
      proxyContractId: '',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(2);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.AccountIdInValid);
    expect(validations[1].errors[0].errorCode).toBe(
      ErrorCode.InvalidContractId,
    );
  });
});
