import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { GetListStableCoin } from '../../../../../src/index.js';

import { logValidation, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK GetListStableCoin Request', () => {
  it('Create simple request', () => {
    const request: GetListStableCoin = new GetListStableCoin({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
    });
    expect(request).not.toBeNull();
  });

  it('GetListStableCoin and validate', () => {
    const request: GetListStableCoin = new GetListStableCoin({
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
    const request: GetListStableCoin = new GetListStableCoin({
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
