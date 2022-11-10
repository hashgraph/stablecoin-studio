import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { GetListStableCoinRequest } from '../../../../../src/index.js';

import { logValidation, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK GetListStableCoinRequest', () => {
  it('Create simple request', () => {
    const request: GetListStableCoinRequest = new GetListStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
    });
    expect(request).not.toBeNull();
  });

  it('GetListStableCoinRequest and validate', () => {
    const request: GetListStableCoinRequest = new GetListStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: GetListStableCoinRequest = new GetListStableCoinRequest({
      account: {
        accountId: 'asd',
      },
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.AccountIdInValid);
  });
});
