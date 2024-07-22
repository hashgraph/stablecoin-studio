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

import { RescueRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import RescueStableCoinService from '../../../../src/app/service/stablecoin/RescueStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new RescueStableCoinService();
const language: Language = new Language();
const token = '0.0.234567';
const amount = '11';
const request = new RescueRequest({
  tokenId: token,
  amount: amount,
});

describe(`Testing RescueStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'rescue').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance rescueStableCoin', async () => {
    const rescueMock = jest
      .spyOn(StableCoin, 'rescue')
      .mockImplementation(async (request: RescueRequest): Promise<boolean> => {
        expect(request.tokenId).toEqual(token);
        expect(request.amount).toEqual(amount);
        return false;
      });

    await service.rescueStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(rescueMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
