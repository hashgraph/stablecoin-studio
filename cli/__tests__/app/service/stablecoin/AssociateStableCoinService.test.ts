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
  AssociateTokenRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import AssociateStableCoinService from '../../../../src/app/service/stablecoin/AssociateStableCoinService';
import { utilsService } from '../../../../src/index.js';

const service = new AssociateStableCoinService();

describe(`Testing AssociateStableCoinService class`, () => {
  const token = '0.0.234567';
  const account = '0.0.356789';

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

  it('Should instance associateStableCoin', async () => {
    const AssociateMock = jest
      .spyOn(StableCoin, 'associate')
      .mockImplementation(
        async (request: AssociateTokenRequest): Promise<boolean> => {
          expect(request.targetId).toEqual(account);
          expect(request.tokenId).toEqual(token);
          return true;
        },
      );
    await service.associateStableCoin(account, token);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(AssociateMock).toHaveBeenCalledTimes(1);
  });
});
