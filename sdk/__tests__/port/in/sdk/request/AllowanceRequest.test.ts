import {
  AllowanceRequest,
} from '../../../../../src/index.js';

import {
  EXAMPLE_TOKEN,
  REQUEST_ACCOUNTS,
} from '../../../../core/core.js';

describe('🧪 SDK Allowance Request', () => {
  it('Create simple request', () => {
    const request: AllowanceRequest = new AllowanceRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
      amount: '1',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
  });

  it('Create a simple request and validate', () => {
    const request: AllowanceRequest = new AllowanceRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
      amount: '1.12345',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: AllowanceRequest = new AllowanceRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
      },
      amount: '1.1234567890123456789',
      proxyContractId: 'asd',
      tokenId: 'asd',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(3);
  });
});
