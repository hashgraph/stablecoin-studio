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

import { StableCoin, TransfersRequest } from '@hashgraph/stablecoin-npm-sdk';
import TransfersStableCoinService from '../../../../src/app/service/stablecoin/TransfersStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new TransfersStableCoinService();
const language: Language = new Language();
const token = '0.0.111111';
const targetsId = ['0.0.22222'];
const amounts = ['2'];
const account_2 = '0.0.33333';
const request = new TransfersRequest({
  tokenId: token,
  targetsId: targetsId,
  amounts: amounts,
  targetId: account_2,
});

describe(`Testing TransfersStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance transfersStableCoin', async () => {
    const transferMock = jest
      .spyOn(StableCoin, 'transfers')
      .mockImplementation(
        async (request: TransfersRequest): Promise<boolean> => {
          expect(request.tokenId).toEqual(token);
          expect(request.targetsId.length).toEqual(targetsId.length);
          expect(request.amounts.length).toEqual(amounts.length);
          expect(request.targetId).toEqual(account_2);
          for (let i = 0; i < targetsId.length; i++) {
            expect(request.targetsId[i]).toEqual(targetsId[i]);
          }
          for (let j = 0; j < amounts.length; j++) {
            expect(request.amounts[j]).toEqual(amounts[j]);
          }

          return false;
        },
      );

    await service.transfersStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(transferMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
