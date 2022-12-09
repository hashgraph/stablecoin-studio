import { BigNumber } from '@hashgraph/hethers';
import ICreateStableCoinServiceRequestModel from '../../../../../src/app/service/stablecoin/model/ICreateStableCoinServiceRequestModel.js';
import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { Account, AccountId, BigDecimal, TokenSupplyType } from '../../../../../src/index.js';
import CreateStableCoinRequest from '../../../../../src/port/in/sdk/request/CreateStableCoinRequest.js';
import RequestMapper from '../../../../../src/port/in/sdk/request/mapping/RequestMapper.js';
import { logValidation, MAX_SUPPLY } from '../../../../core/core.js';

describe('🧪 SDK Create Stable Coin Request', () => {
  it('Create simple request', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 5,
      treasury: '0.0.1',
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const other: ICreateStableCoinServiceRequestModel = RequestMapper.map(
      request,
      {
        treasury: AccountId,
      },
    );
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
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple request with 18 decimals', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 18,
      initialSupply: '9.123456789012345677',
      maxSupply: '9.123456789012345677',
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple request with 18 decimals with invalid max supply', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 18,
      initialSupply: '1.123456789012345677',
      maxSupply: BigDecimal.fromValue(
        BigNumber.from(MAX_SUPPLY + 1n),
        18,
      ).toString(),
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
  });

  it('Create and validate simple request with 18 decimals with invalid supply type', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 18,
      initialSupply: '1.123456789012345677',
      maxSupply: BigDecimal.fromValue(
        BigNumber.from(MAX_SUPPLY),
        18,
      ).toString(),
      supplyType: TokenSupplyType.INFINITE,
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
  });

  it('Create and validate simple request with 18 decimals with different decimal values', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'name',
      symbol: 'symbol',
      decimals: 14,
      initialSupply: '1.1234',
      maxSupply: '10.123456789',
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
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
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
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

  it('Create and validate request [initialSupply, maxSupply]', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'HSD',
      symbol: 'symbol',
      decimals: 5,
      initialSupply: '1000.adsda.asdqw',
      maxSupply: '1000.12345',
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(1);
    request.initialSupply = '1000';
    const validationsOk = request.validate();
    expect(validationsOk.length).toBe(0);
  });

  it('Create and validate request, fail with [initialSupply, adminKey, treasury, autoRenewAccount, factory, hederaERC20]', () => {
    const request: CreateStableCoinRequest = new CreateStableCoinRequest({
      account: {
        accountId: '0.0.1',
      },
      name: 'HSD',
      symbol: 'symbol',
      decimals: 12,
      initialSupply: '1000.adsda.asdqw',
      maxSupply: '1000.12345',
      adminKey: {
        key: 'asdasd',
        type: '',
      },
      treasury: '1234',
      autoRenewAccount: '1234',
      stableCoinFactory: 'asada',
      hederaERC20:'hjhjhj'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(6);
  });

  it('Create and map a full request', () => {
    const requestVals = {
      account: {
        accountId: '0.0.1',
      },
      name: 'HSD',
      symbol: 'symbol',
      decimals: 5,
      initialSupply: '1000',
      maxSupply: '1000.12345',
      adminKey: {
        key: 'd41996edecdc0975bb72d94bce4a1207d40f8a3b0a90c49d3ef3a697bb09c170',
        type: 'ED25519',
      },
      autoRenewAccount: '0.0.1',
      freezeDefault: false,
      stableCoinFactory: '0.0.2',
      hederaERC20: '0.0.3'
    };
    const request: CreateStableCoinRequest = new CreateStableCoinRequest(
      requestVals,
    );
    expect(request).not.toBeNull();
    const validations = request.validate();
    
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(0);
    const mappedRequest: ICreateStableCoinServiceRequestModel =
      RequestMapper.map(request, {
        treasury: AccountId,
        autoRenewAccount: AccountId,
        initialSupply: (val) => BigDecimal.fromString(val),
        maxSupply: (val) => BigDecimal.fromString(val),
      });
    expect(mappedRequest).not.toBeNull();
    expect(mappedRequest.account).toBeInstanceOf(Account);
    expect(mappedRequest.name).toBe(requestVals.name);
    expect(mappedRequest.symbol).toBe(requestVals.symbol);
    expect(mappedRequest.decimals).toBe(requestVals.decimals);
    expect(mappedRequest.initialSupply).toBeInstanceOf(BigDecimal);
    expect(mappedRequest.maxSupply).toBeInstanceOf(BigDecimal);
    expect(mappedRequest.autoRenewAccount).toBeInstanceOf(AccountId);
  });
});
