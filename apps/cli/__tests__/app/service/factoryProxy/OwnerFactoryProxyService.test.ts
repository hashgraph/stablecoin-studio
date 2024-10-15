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
  AcceptFactoryProxyOwnerRequest,
  ChangeFactoryProxyOwnerRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import OwnerFactoryProxyService from '../../../../src/app/service/factoryProxy/OwnerFactoryProxyService.js';
import Language from '../../../../src/domain/language/Language.js';
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType.js';

const language: Language = new Language();

describe('ownerFactoryProxyService', () => {
  const account: IAccountConfig = {
    accountId: '0.0.4444444',
    type: AccountType.SelfCustodial,
    network: '',
    alias: '',
  };
  const factoryId = '0.0.123456';
  const targetId = '0.0.234567';

  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(utilsService, 'getCurrentAccount').mockReturnValue(account);
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'dir').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should change the factory proxy admin owner', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'changeFactoryProxyOwner')
      .mockImplementation(
        async (request: ChangeFactoryProxyOwnerRequest): Promise<boolean> => {
          expect(request.factoryId).toEqual(factoryId);
          expect(request.targetId).toEqual(targetId);
          return true;
        },
      );

    // create method request
    const req: ChangeFactoryProxyOwnerRequest =
      new ChangeFactoryProxyOwnerRequest({
        factoryId: factoryId,
        targetId: targetId,
      });

    // method call
    await new OwnerFactoryProxyService().changeFactoryProxyOwner(req);

    // verify
    expect(changeFactoryProxyOwnerMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('should accept the factory proxy admin owner changes', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const acceptFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'acceptFactoryProxyOwner')
      .mockImplementation(
        async (request: AcceptFactoryProxyOwnerRequest): Promise<boolean> => {
          expect(request.factoryId).toEqual(factoryId);
          return true;
        },
      );

    // create method request
    const req: AcceptFactoryProxyOwnerRequest =
      new AcceptFactoryProxyOwnerRequest({
        factoryId: factoryId,
      });

    // method call
    await new OwnerFactoryProxyService().acceptFactoryProxyOwner(req);

    // verify
    expect(acceptFactoryProxyOwnerMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('should cancel the factory proxy admin owner changes', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'changeFactoryProxyOwner')
      .mockImplementation(
        async (request: ChangeFactoryProxyOwnerRequest): Promise<boolean> => {
          expect(request.factoryId).toEqual(factoryId);
          expect(request.targetId).toEqual(account.accountId);
          return true;
        },
      );

    const acceptFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'acceptFactoryProxyOwner')
      .mockImplementation(
        async (request: AcceptFactoryProxyOwnerRequest): Promise<boolean> => {
          expect(request.factoryId).toEqual(factoryId);
          return true;
        },
      );

    // create method request
    const req: string = factoryId;

    // method call
    await new OwnerFactoryProxyService().cancelFactoryProxyOwner(req);

    // verify
    expect(acceptFactoryProxyOwnerMock).toHaveBeenCalled();
    expect(changeFactoryProxyOwnerMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
