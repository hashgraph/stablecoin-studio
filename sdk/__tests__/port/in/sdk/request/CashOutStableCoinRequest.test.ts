import ICashOutStableCoinServiceRequestModel from '../../../../../src/app/service/stablecoin/model/ICashOutStableCoinServiceRequestModel.js';
import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { CashOutStableCoinRequest } from '../../../../../src/index.js';
import RequestMapper from '../../../../../src/port/in/sdk/request/mapping/RequestMapper.js';
import {REQUEST_ACCOUNTS } from '../../../../core/core.js';
 
describe('🧪 SDK CashOut Stable Coin Request', () => {
  it('Create simple request', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
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
    const other: ICashOutStableCoinServiceRequestModel =
      RequestMapper.map(request);
  
  });

  it('CashOut and validate', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '100',
      proxyContractId: '0.0.48826121',
      tokenId: '0.0.48826122',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('CashOut and validate simple request with decimals', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '100',
      proxyContractId: '0.0.48826121',
      tokenId: '0.0.48826122',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
   
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: '1asd',
      proxyContractId: '0.0.48826169',
      tokenId: '0.0.48826175',
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
    });
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.InvalidType);
  });

  it('Create and validate request [amount]', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
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
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(1);
    request.amount = '1000';
    const validationsOk = request.validate();
    expect(validationsOk.length).toBe(0);
  });

  
  it('Create and validate request, fail with [amount, target,tokenId]', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
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

  it('Create and validate request, all fail ', () => {
    const request: CashOutStableCoinRequest = new CashOutStableCoinRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      amount: 'fail',
      proxyContractId: 'fail',
      tokenId: 'token',
      targetId: 'targetId',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(4);
    console.log(validations);
  });
});
