import { Account } from '@hashgraph/stablecoin-npm-sdk';
import ListStableCoinService from '../../../../src/app/service/stablecoin/ListStableCoinService';
import { utilsService } from '../../../../src/index.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const service = new ListStableCoinService();
const currentAccount = {
  accountId: 'id',
  type: AccountType.SelfCustodial,
  selfCustodial: {
    privateKey: {
      key: 'key',
      type: 'type',
    },
  },
  network: 'network',
  alias: 'aliasts',
};
const listStableCoins = {
  coins: [
    {
      symbol: 'TEST',
      id: 'id',
    },
  ],
};

describe(`Testing ListStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest.spyOn(Account, 'listStableCoins').mockResolvedValue(listStableCoins);
    jest.spyOn(utilsService, 'drawTableListStableCoin').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance listStableCoins when true', async () => {
    await service.listStableCoins();

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Account.listStableCoins).toHaveBeenCalledTimes(1);
    expect(utilsService.drawTableListStableCoin).toHaveBeenCalledTimes(1);
  });

  it('Should instance listStableCoins when false', async () => {
    await service.listStableCoins(false);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Account.listStableCoins).toHaveBeenCalledTimes(1);
    expect(utilsService.drawTableListStableCoin).not.toHaveBeenCalled();
  });
});
