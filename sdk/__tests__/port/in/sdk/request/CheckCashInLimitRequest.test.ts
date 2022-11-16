import { CheckCashInLimitRequest } from '../../../../../src/index.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Check Cash In Limit Request', () => {
  it('Create simple request', () => {
    const request: CheckCashInLimitRequest = new CheckCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: '',
      proxyContractId: '',
      tokenId: ''
    });
    expect(request).not.toBeNull();
  });

  it('Check cash in role limit and validate', () => {
    const request: CheckCashInLimitRequest = new CheckCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate request, fail with [target]', () => {
    const request: CheckCashInLimitRequest = new CheckCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(1);
  });
  it('Create and validate request, fail with [target, tokenId]', () => {
    const request: CheckCashInLimitRequest = new CheckCashInLimitRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(2);
  });
});
