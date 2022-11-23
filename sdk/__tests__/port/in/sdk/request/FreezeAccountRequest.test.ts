import { FreezeAccountRequest } from '../../../../../src/index.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Freeze Request', () => {
  it('Create simple request', () => {
    const request: FreezeAccountRequest = new FreezeAccountRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: '',
      tokenId: '',
      targetId: '',
    });
    expect(request).not.toBeNull();
  });

  it('FreezeAccountRequest and validate', () => {
    const request: FreezeAccountRequest = new FreezeAccountRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate request, fail with [tokenId]', () => {
    const request: FreezeAccountRequest = new FreezeAccountRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });

    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(1);
  });

  it('Create and validate request, fail with [tokenId,targetId]', () => {
    const request: FreezeAccountRequest = new FreezeAccountRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
      targetId: 'targetInvalid',
    });

    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(2);
  });
});
