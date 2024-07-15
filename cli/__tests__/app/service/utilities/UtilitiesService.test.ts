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
import {
  utilsService,
  configurationService,
  setMirrorNodeService,
  setRPCService,
} from '../../../../src/index.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';
import { MIRROR_NODE, RPC } from '../../../../src/core/Constants.js';

describe('UtilitiesService', () => {
  const network = 'testnet';
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
    network: network,
    alias: 'mockAlias',
  };

  const mockCurrentNetwork = {
    name: network,
    chainId: 1234,
    consensusNodes: [
      {
        url: 'whatever',
        nodeId: '3',
      },
    ],
  };

  const mockCurrentMirror = {
    name: 'testnet',
    network: network,
    baseUrl: 'https://testnet.mirrornode.com',
    apiKey: '',
    headerName: '',
    selected: true,
  };
  const mockCurrentRPC = {
    name: 'testnet',
    network: network,
    baseUrl: 'https://testnet.rpc.com',
    apiKey: '',
    headerName: '',
    selected: true,
  };

  const mockCurrentBackend = {
    endpoint: 'http://localhost:3000/path',
  };

  const mockLogConfiguration = {
    level: 'debug',
  };

  const mockCurrentFactory = {
    id: '0.0.1234567',
    network: network,
  };

  const mockCurrentHederaTokenManager = {
    id: '0.0.7654321',
    network: network,
  };

  configurationService.getLogConfiguration = jest
    .fn()
    .mockReturnValue(mockLogConfiguration);

  configurationService.getConfiguration = jest.fn().mockReturnValue({
    defaultNetwork: 'testnet',
    networks: [mockCurrentNetwork],
    accounts: [mockAccount],
    mirrors: [mockCurrentMirror],
    rpcs: [mockCurrentRPC],
    backend: mockCurrentBackend,
    logs: mockLogConfiguration,
    factories: [mockCurrentFactory],
  });

  let networkInitSpy;
  let networkConnectSpy;
  beforeEach(() => {
    networkInitSpy = jest.spyOn(Network, 'init').mockResolvedValue(undefined);
    networkConnectSpy = jest
      .spyOn(Network, 'connect')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    // restore mocks
    networkInitSpy.mockRestore();
    networkConnectSpy.mockRestore();
  });

  it('should initialize the SDK and connect to the network', async () => {
    // method call
    await expect(utilsService.initSDK()).rejects.toThrow();
    await utilsService.setCurrentAccount(mockAccount);
    await expect(utilsService.initSDK()).rejects.toThrow();
    await utilsService.setCurrentNetwotk(mockCurrentNetwork);
    await expect(utilsService.initSDK()).rejects.toThrow();
    await utilsService.setCurrentMirror(mockCurrentMirror);
    await expect(utilsService.initSDK()).rejects.toThrow();
    await utilsService.setCurrentBackend(mockCurrentBackend);
    await expect(utilsService.initSDK()).rejects.toThrow();
    await utilsService.setCurrentRPC(mockCurrentRPC);
    await utilsService.setCurrentFactory(mockCurrentFactory);
    await utilsService.setCurrentHederaTokenManager(
      mockCurrentHederaTokenManager,
    );
    await utilsService.initSDK();

    const account = utilsService.getCurrentAccount();
    const backend = utilsService.getCurrentBackend();
    const factory = utilsService.getCurrentFactory();
    const hederaTokenManager = utilsService.getCurrentHederaTokenManager();
    const mirrorNode = utilsService.getCurrentMirror();
    const network = utilsService.getCurrentNetwork();
    const rpc = utilsService.getCurrentRPC();

    // verify
    expect(configurationService.getLogConfiguration).toHaveBeenCalledTimes(5);
    expect(account).toEqual(mockAccount);
    expect(backend).toEqual(mockCurrentBackend);
    expect(factory).toEqual(mockCurrentFactory);
    expect(hederaTokenManager).toEqual(mockCurrentHederaTokenManager);
    expect(mirrorNode).toEqual(mockCurrentMirror);
    expect(network).toEqual(mockCurrentNetwork);
    expect(rpc).toEqual(mockCurrentRPC);
  });

  it('configure network', async () => {
    jest
      .spyOn(setMirrorNodeService, 'manageMirrorNodeMenu')
      .mockImplementation(async (_network: string): Promise<void> => {
        expect(_network).toEqual(network);
      });
    jest
      .spyOn(setRPCService, 'manageRPCMenu')
      .mockImplementation(async (_network: string): Promise<void> => {
        expect(_network).toEqual(network);
      });

    jest.spyOn(utilsService, 'showError').mockImplementation();

    // method call
    await utilsService.setCurrentAccount(mockAccount);
    await utilsService.setCurrentNetwotk(mockCurrentNetwork);
    await utilsService.setCurrentMirror(mockCurrentMirror);
    await utilsService.setCurrentBackend(mockCurrentBackend);
    await utilsService.setCurrentRPC(mockCurrentRPC);
    await utilsService.setCurrentFactory(mockCurrentFactory);
    await utilsService.setCurrentHederaTokenManager(
      mockCurrentHederaTokenManager,
    );
    await utilsService.initSDK();

    jest.spyOn(utilsService, 'defaultMultipleAsk').mockResolvedValue(network);

    await utilsService.configureNetwork(MIRROR_NODE);
    await utilsService.configureNetwork(RPC);
    await utilsService.configureNetwork('nothing');
    expect(utilsService.showError).toHaveBeenCalledTimes(1);
  });
});
