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
  ContractId,
  Factory,
  Proxy,
  UpgradeImplementationRequest,
} from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import ImplementationProxyService from '../../../../src/app/service/proxy/ImplementationProxyService.js';
import { IFactoryConfig } from '../../../../src/domain/configuration/interfaces/IFactoryConfig.js';

const language: Language = new Language();

describe('implementationProxyService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should upgrade the proxy implementation', async () => {
    // mocks
    jest.spyOn(console, 'log');
    const upgradeImplementationMock = jest
      .spyOn(Proxy, 'upgradeImplementation')
      .mockImplementation(() => Promise.resolve(true));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('0.0.1');

    const iFactoryConfig: IFactoryConfig = {
      id: '0.0.345678',
      network: 'Testnet',
    };

    const utilsServiceGetCurrentFactoryMock = jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue(iFactoryConfig);

    const implementationProxyService: ImplementationProxyService =
      new ImplementationProxyService();

    const implementationFactoryGetHederaTokenManagerListMock = jest
      .spyOn(Factory, 'getHederaTokenManagerList')
      .mockResolvedValue([new ContractId('0.0.1')]);

    // create method request
    const req: UpgradeImplementationRequest = new UpgradeImplementationRequest({
      tokenId: '0.0.123456',
      implementationAddress: '0.0.234567',
    });

    // method call
    await implementationProxyService.upgradeImplementationOwner(
      req,
      '0.0.456789',
    );

    // verify
    expect(upgradeImplementationMock).toHaveBeenCalled();
    expect(utilsServiceGetCurrentFactoryMock).toHaveBeenCalled();
    expect(defaultMultipleAskMock).toHaveBeenCalled();
    expect(
      implementationFactoryGetHederaTokenManagerListMock,
    ).toHaveBeenCalled();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
