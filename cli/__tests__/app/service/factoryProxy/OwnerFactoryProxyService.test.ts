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
  ChangeFactoryProxyOwnerRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import OwnerFactoryProxyService from '../../../../src/app/service/factoryProxy/OwnerFactoryProxyService.js';
import Language from '../../../../src/domain/language/Language.js';

const language: Language = new Language();

describe('ownerFactoryProxyService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should change the factory proxy admin owner', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'changeFactoryProxyOwner')
      .mockImplementation(() => Promise.resolve(true));

    // create method request
    const req: ChangeFactoryProxyOwnerRequest =
      new ChangeFactoryProxyOwnerRequest({
        factoryId: '0.0.123456',
        targetId: '0.0.234567',
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
});
