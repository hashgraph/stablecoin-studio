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

import { PauseRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import PauseStableCoinService from '../../../../src/app/service/stablecoin/PauseStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const token = '0.0.234567';
const service = new PauseStableCoinService();
const language: Language = new Language();
const request = new PauseRequest({ tokenId: token });

describe(`Testing PauseStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance pauseStableCoin', async () => {
    const PauseMock = jest
      .spyOn(StableCoin, 'pause')
      .mockImplementation(async (request: PauseRequest): Promise<boolean> => {
        expect(request.tokenId).toEqual(token);
        return false;
      });

    await service.pauseStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(PauseMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance unpauseStableCoin when granted', async () => {
    const UnpauseMock = jest
      .spyOn(StableCoin, 'unPause')
      .mockImplementation(async (request: PauseRequest): Promise<boolean> => {
        expect(request.tokenId).toEqual(token);
        return false;
      });

    await service.unpauseStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(UnpauseMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
