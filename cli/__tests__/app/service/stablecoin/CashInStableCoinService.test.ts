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

import { CashInRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import CashInStableCoinService from '../../../../src/app/service/stablecoin/CashInStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new CashInStableCoinService();
const language: Language = new Language();
const token = '0.0.1234567';
const account = '0.0.7654321';
const amount = '10';
const request = new CashInRequest({
  tokenId: token,
  targetId: account,
  amount: amount,
});

describe(`Testing CashInStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance cashInStableCoin', async () => {
    const CashInMock = jest
      .spyOn(StableCoin, 'cashIn')
      .mockImplementation(async (request: CashInRequest): Promise<boolean> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(token);
        expect(request.amount).toEqual(amount);
        return true;
      });

    await service.cashInStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(CashInMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
