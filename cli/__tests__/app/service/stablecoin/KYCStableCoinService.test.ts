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

import { KYCRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import KYCStableCoinService from '../../../../src/app/service/stablecoin/KYCStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import colors from 'colors';

const service = new KYCStableCoinService();
const language: Language = new Language();
const token = '0.0.234567';
const account = '0.0.356789';
const request = new KYCRequest({
  tokenId: token,
  targetId: account,
});

describe(`Testing KYCStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(StableCoin, 'grantKyc').mockImplementation();
    jest.spyOn(StableCoin, 'revokeKyc').mockImplementation();
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

  it('Should instance grantKYCToAccount', async () => {
    const GrantKYCMock = jest
      .spyOn(StableCoin, 'grantKyc')
      .mockImplementation(async (request: KYCRequest): Promise<boolean> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(token);
        return true;
      });

    await service.grantKYCToAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(GrantKYCMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance revokeKYCFromAccount', async () => {
    const RevokeKYCMock = jest
      .spyOn(StableCoin, 'revokeKyc')
      .mockImplementation(async (request: KYCRequest): Promise<boolean> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(token);
        return true;
      });

    await service.revokeKYCFromAccount(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(RevokeKYCMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance isAccountKYCGranted', async () => {
    const IsKYCMock = jest
      .spyOn(StableCoin, 'isAccountKYCGranted')
      .mockImplementation(async (request: KYCRequest): Promise<boolean> => {
        expect(request.targetId).toEqual(account);
        expect(request.tokenId).toEqual(token);
        return false;
      });

    await service.isAccountKYCGranted(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(IsKYCMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.accountKYCNotGranted')
        .replace('${address}', request.targetId)
        .replace('${token}', colors.yellow(request.tokenId)) + '\n',
    );
  });

  it('Should instance isAccountKYCGranted when granted', async () => {
    jest.spyOn(StableCoin, 'isAccountKYCGranted').mockResolvedValue(true);
    await service.isAccountKYCGranted(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.isAccountKYCGranted).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('state.accountKYCGranted')
        .replace('${address}', request.targetId)
        .replace('${token}', colors.yellow(request.tokenId)) + '\n',
    );
  });
});
