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
  networkWizardService,
  utilsService,
  configurationService,
} from '../../../../src/index.js';

describe('networkWizardService', () => {
  const configurationMock = {
    defaultNetwork: 'testnet',
    networks: [],
    accounts: [],
    rpcs: [
      {
        name: 'rpc-1',
        network: 'testnet',
        baseUrl: 'https://testnet.rpcnetwork.com',
        apiKey: '',
        headerName: '',
        selected: false,
      },
      {
        name: 'rpc-2',
        network: 'testnet',
        baseUrl: 'https://testnet.rpcnetwork.com',
        apiKey: '',
        headerName: '',
        selected: false,
      },
    ],
    factories: [],
    mirrors: [
      {
        name: 'mirror-1',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.com',
        apiKey: '',
        headerName: '',
        selected: false,
      },
      {
        name: 'mirror-2',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.com',
        apiKey: '',
        headerName: '',
        selected: false,
      },
    ],
  };

  it('should choose a mirror node network and return true', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setConfigurationMock = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockImplementation();

    const getCurrentMirrorMock = jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue({
        name: 'testnet-1',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.com',
        apiKey: '',
        headerName: '',
        selected: true,
      });
    const setCurrentMirrorMock = jest
      .spyOn(utilsService, 'setCurrentMirror')
      .mockImplementation();
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('mirror-1');

    // method call
    const result = await networkWizardService.chooseMirrorNodeNetwork(
      'testnet',
    );

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setConfigurationMock).toHaveBeenCalled();
    expect(getCurrentMirrorMock).toHaveBeenCalled();
    expect(setCurrentMirrorMock).toHaveBeenCalled();
    expect(defaultMultipleAskMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not choose a mirror node network and return false', async () => {
    // mocks
    configurationMock.mirrors[0].selected = true;
    configurationMock.mirrors[1].selected = true;

    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const showMessageMock = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();

    // method call
    const result = await networkWizardService.chooseMirrorNodeNetwork(
      'testnet',
    );

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(showMessageMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should choose a rpc network and return true', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setConfigurationMock = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockImplementation();

    const getCurrentRPCMock = jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue({
        name: 'rpc-1',
        network: 'testnet',
        baseUrl: 'https://testnet.rpcnetwork.com',
        apiKey: '',
        headerName: '',
        selected: true,
      });
    const setCurrentRPCMock = jest
      .spyOn(utilsService, 'setCurrentRPC')
      .mockImplementation();
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('rpc-1');

    // method call
    const result = await networkWizardService.chooseRPCNetwork('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setConfigurationMock).toHaveBeenCalled();
    expect(getCurrentRPCMock).toHaveBeenCalled();
    expect(setCurrentRPCMock).toHaveBeenCalled();
    expect(defaultMultipleAskMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not choose a rpc network and return false', async () => {
    // mocks
    configurationMock.rpcs[0].selected = true;
    configurationMock.rpcs[1].selected = true;

    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const showMessageMock = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();

    // method call
    const result = await networkWizardService.chooseRPCNetwork('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(showMessageMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should choose the last mirror node for the specified network', () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const setCurrentMirrorMock = jest
      .spyOn(utilsService, 'setCurrentMirror')
      .mockImplementation();

    // method call
    networkWizardService.chooseLastMirrorNode('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setCurrentMirrorMock).toHaveBeenCalledWith(
      configurationMock.mirrors[1],
    );
  });

  it('should choose the last rpc for the specified network', () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const setCurrentRPCMock = jest
      .spyOn(utilsService, 'setCurrentRPC')
      .mockImplementation();

    // method call
    networkWizardService.chooseLastRPC('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setCurrentRPCMock).toHaveBeenCalledWith(configurationMock.rpcs[1]);
  });

  it('should set the last mirror node of the specified network as selected', () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setConfigurationMock = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockImplementation();

    // method call
    networkWizardService.setLastMirrorNodeAsSelected('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setConfigurationMock).toHaveBeenCalledWith(configurationMock);
  });

  it('should set the last rpc of the specified network as selected', () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setConfigurationMock = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockImplementation();

    // method call
    networkWizardService.setLastRPCAsSelected('testnet');

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setConfigurationMock).toHaveBeenCalledWith(configurationMock);
  });
});
