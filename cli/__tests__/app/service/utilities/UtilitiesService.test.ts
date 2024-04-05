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

import { Network } from '@hashgraph/stablecoin-npm-sdk';
import { utilsService, configurationService } from '../../../../src/index.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

describe('UtilitiesService', () => {
  it('should initialize the SDK and connect to the network', async () => {
    // mocks
    const mockAccount = {
      accountId: 'mockAccountId',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'mockPrivateKey',
          type: 'mockPrivateKeyType',
        },
      },
      network: 'mockNetwork',
      alias: 'mockAlias',
    };

    const mockCurrentNetwork = {
      name: 'mockNetworkName',
    };

    const mockCurrentMirror = {
      name: 'testnet',
      network: 'testnet',
      baseUrl: 'https://testnet.mirrornode.com',
      apiKey: '',
      headerName: '',
      selected: true,
    };
    const mockCurrentRPC = {
      name: 'testnet',
      network: 'testnet',
      baseUrl: 'https://testnet.rpc.com',
      apiKey: '',
      headerName: '',
      selected: true,
    };

    const mockLogConfiguration = {
      level: 'debug',
    };

    const networkInitSpy = jest
      .spyOn(Network, 'init')
      .mockResolvedValue(undefined);
    const networkConnectSpy = jest
      .spyOn(Network, 'connect')
      .mockResolvedValue(undefined);

    configurationService.getLogConfiguration = jest
      .fn()
      .mockReturnValue(mockLogConfiguration);
    utilsService.getCurrentAccount = jest.fn().mockReturnValue(mockAccount);
    utilsService.getCurrentNetwork = jest
      .fn()
      .mockReturnValue(mockCurrentNetwork);
    utilsService.getCurrentMirror = jest
      .fn()
      .mockReturnValue(mockCurrentMirror);
    utilsService.getCurrentRPC = jest.fn().mockReturnValue(mockCurrentRPC);

    // method call
    await utilsService.initSDK();

    // verify
    expect(networkInitSpy).toHaveBeenCalled();
    expect(networkConnectSpy).toHaveBeenCalled();

    // restore mocks
    networkInitSpy.mockRestore();
    networkConnectSpy.mockRestore();
  });
});
