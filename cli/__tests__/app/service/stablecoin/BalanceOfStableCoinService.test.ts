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

import {
  Balance,
  BigDecimal,
  GetAccountBalanceRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import BalanceOfStableCoinService from '../../../../src/app/service/stablecoin/BalanceOfStableCoinService';
import { utilsService } from '../../../../src/index.js';

const service = new BalanceOfStableCoinService();
const token = '0.0.234567';
const account = '0.0.356789';
const request = new GetAccountBalanceRequest({
  tokenId: token,
  targetId: account,
});
let BalanceMock;

describe(`Testing BalanceOfStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
    jest
      .spyOn(StableCoin, 'getBalanceOf')
      .mockResolvedValue(new Balance(new BigDecimal('10')));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance getBalanceOfStableCoin', async () => {
    BalanceMock = jest
      .spyOn(StableCoin, 'getBalanceOf')
      .mockImplementation(
        async (request: GetAccountBalanceRequest): Promise<Balance> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return new Balance(BigDecimal.fromString('10'));
        },
      );

    await service.getBalanceOfStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(BalanceMock).toHaveBeenCalledTimes(1);
  });

  it('Should instance getBalanceOfStableCoin_2', async () => {
    BalanceMock = jest
      .spyOn(StableCoin, 'getBalanceOf')
      .mockImplementation(
        async (request: GetAccountBalanceRequest): Promise<Balance> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return new Balance(BigDecimal.fromString('10'));
        },
      );

    const balance = await service.getBalanceOfStableCoin_2(request);

    expect(balance).toEqual('10');
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(BalanceMock).toHaveBeenCalledTimes(1);
  });
});
