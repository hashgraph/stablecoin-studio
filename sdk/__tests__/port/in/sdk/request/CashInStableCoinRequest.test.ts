import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { CashInStableCoinRequest } from '../../../../../src/index.js';
import { logValidation, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK CashIn Stable Coin Request', () => {
  it('Create simple request', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '10',
      proxyContractId: '',
      tokenId: '',
      targetId: '',
    });
    expect(request).not.toBeNull();
  });

  it('CashIn and validate', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '10',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('CashIn and validate simple request with decimals', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1.456',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // logValidation(validations);
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1asd',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.InvalidType);
  });

  it('Create and validate request [amount]', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1asd',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // logValidation(validations);
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(1);
    request.amount = '1000';
    const validationsOk = request.validate();
    expect(validationsOk.length).toBe(0);
  });

  it('Create and validate request, fail with [amount, target]', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1asd',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: 'qwe123',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // logValidation(validations);
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(2);
  });
  it('Create and validate request, fail with [amount, target,tokenId]', () => {
    const request: CashInStableCoinRequest = new CashInStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1asd',
      proxyContractId: '0.0.48826169',
      tokenId: '0.48826175',
      targetId: 'qwe123',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // logValidation(validations);
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(3);
  });
});
