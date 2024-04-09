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
  Proxy,
  UpgradeFactoryImplementationRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ImplementationFactoryProxyService from '../../../../src/app/service/factoryProxy/ImplementationFactoryProxyService.js';
import Language from '../../../../src/domain/language/Language.js';

const language: Language = new Language();

describe('implementationFactoryProxyService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upgrade the factory implementation', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const upgradeFactoryImplementationMock = jest
      .spyOn(Proxy, 'upgradeFactoryImplementation')
      .mockImplementation(() => Promise.resolve(true));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValue('0.0.345678');

    // create method request
    const req: UpgradeFactoryImplementationRequest =
      new UpgradeFactoryImplementationRequest({
        factoryId: '0.0.123456',
        implementationAddress: '0.0.234567',
      });

    // method call
    await new ImplementationFactoryProxyService().upgradeImplementation(
      req,
      '0.0.456789',
    );

    // verify
    expect(defaultSingleAskMock).toHaveBeenCalled();
    expect(upgradeFactoryImplementationMock).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
