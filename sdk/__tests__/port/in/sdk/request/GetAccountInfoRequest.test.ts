import { GetAccountInfoRequest } from '../../../../../src/index.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Get Account Info Request', () => {
  it('Create simple request', () => {
    const request: GetAccountInfoRequest = new GetAccountInfoRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      }
    });
    expect(request).not.toBeNull();
  });

  it('Get account info and validate', () => {
    const request: GetAccountInfoRequest = new GetAccountInfoRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      }
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });
});
