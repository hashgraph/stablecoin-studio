import { DeleteStableCoinRequest } from '../../../../../src_old/index.js.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Delete Request', () => {
  it('Create simple request', () => {
    const request: DeleteStableCoinRequest = new DeleteStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: '',
      tokenId: '',
    });
    expect(request).not.toBeNull();
  });

  it('Get roles balance and validate', () => {
    const request: DeleteStableCoinRequest = new DeleteStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate request, fail with [tokenId]', () => {
    const request: DeleteStableCoinRequest = new DeleteStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
    });

    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(1);
  });
});
