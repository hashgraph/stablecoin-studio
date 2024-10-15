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
  FreezeAccountRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import FreezeStableCoinService from '../../../../src/app/service/stablecoin/FreezeStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import colors from 'colors';

const service = new FreezeStableCoinService();
const language: Language = new Language();
const token = '0.0.234567';
const account = '0.0.356789';
const request = new FreezeAccountRequest({
  tokenId: token,
  targetId: account,
});

describe(`Testing FreezeStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(StableCoin, 'freeze').mockImplementation();
    jest.spyOn(StableCoin, 'unFreeze').mockImplementation();
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

  it('Should instance freezeAccount', async () => {
    const FreezeMock = jest
      .spyOn(StableCoin, 'freeze')
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<boolean> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return true;
        },
      );

    await service.freezeAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(FreezeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance unfreezeAccount', async () => {
    const UnFreezeMock = jest
      .spyOn(StableCoin, 'unFreeze')
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<boolean> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return true;
        },
      );

    await service.unfreezeAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(UnFreezeMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance isAccountFrozenDisplay', async () => {
    const IsFrozenMock = jest
      .spyOn(StableCoin, 'isAccountFrozen')
      .mockImplementation(
        async (request: FreezeAccountRequest): Promise<boolean> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return false;
        },
      );

    await service.isAccountFrozenDisplay(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(IsFrozenMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.accountNotFrozen')
        .replace('${address}', request.targetId)
        .replace('${token}', colors.yellow(request.tokenId)) + '\n',
    );
  });

  it('Should instance isAccountFrozenDisplay when isfrozen', async () => {
    jest.spyOn(StableCoin, 'isAccountFrozen').mockResolvedValue(true);
    await service.isAccountFrozenDisplay(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.isAccountFrozen).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.accountFrozen')
        .replace('${address}', request.targetId)
        .replace('${token}', colors.yellow(request.tokenId)) + '\n',
    );
  });

  it('Should instance isAccountFrozen', async () => {
    jest.spyOn(StableCoin, 'isAccountFrozen').mockResolvedValue(true);
    await service.isAccountFrozen(request);

    expect(service).not.toBeNull();
    expect(StableCoin.isAccountFrozen).toHaveBeenCalledTimes(1);
    expect(console.log).not.toHaveBeenCalled();
  });
});
