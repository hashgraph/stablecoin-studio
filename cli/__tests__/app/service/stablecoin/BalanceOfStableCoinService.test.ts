import {
  Balance,
  BigDecimal,
  GetAccountBalanceRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import BalanceOfStableCoinService from '../../../../src/app/service/stablecoin/BalanceOfStableCoinService';
import { utilsService } from '../../../../src/index.js';

const service = new BalanceOfStableCoinService();
const request = new GetAccountBalanceRequest({
  tokenId: '0.0.012345',
  targetId: '',
});

describe(`Testing BalanceOfStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest
      .spyOn(StableCoin, 'getBalanceOf')
      .mockResolvedValue(new Balance(new BigDecimal('10')));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance getBalanceOfStableCoin', async () => {
    await service.getBalanceOfStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.getBalanceOf).toHaveBeenCalledTimes(1);
  });

  it('Should instance getBalanceOfStableCoin_2', async () => {
    const balance = await service.getBalanceOfStableCoin_2(request);

    expect(balance).toEqual('10');
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.getBalanceOf).toHaveBeenCalledTimes(1);
  });
});
