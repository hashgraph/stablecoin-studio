import ICreateStableCoinServiceRequestModel from '../../../../../src/app/service/stablecoin/model/ICreateStableCoinServiceRequestModel.js';
import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { AccountId } from '../../../../../src/index.js';
import CreateStableCoinRequest from '../../../../../src/port/in/sdk/request/CreateStableCoinRequest.js';
import RequestMapper from '../../../../../src/port/in/sdk/request/mapping/RequestMapper.js';

describe('🧪 SDK Create Stable Coin Request', () => {
  it('Create simple request', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 5,
      treasury: '0.0.1'
    });
    expect(request).not.toBeNull();
    const other: ICreateStableCoinServiceRequestModel =
      RequestMapper.map(request, {
        treasury: AccountId,
      });
    console.log(other);
  });

  it('Create and validate simple request', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 5,
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: '_'.repeat(159),
      symbol: 'symbol',
      decimals: 5,
    });
    expect(request).not.toBeNull();
    console.log(request);
    const validations = request.validate();
    console.log(validations);
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.InvalidLength);
  });
});
