/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
    {
      symbol: 'TEST_2',
      id: 'id_2',
    },
  ],
};

describe(`Testing ListStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
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
    const result = await service.listStableCoins();

    expect(result.coins.length).toEqual(listStableCoins.coins.length);
    for (let i = 0; i < listStableCoins.coins.length; i++) {
      expect(result.coins[i].id).toEqual(listStableCoins.coins[i].id);
      expect(result.coins[i].symbol).toEqual(listStableCoins.coins[i].symbol);
    }

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
