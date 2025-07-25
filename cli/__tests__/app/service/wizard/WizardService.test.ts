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
  wizardService,
  utilsService,
  configurationService,
  language,
} from '../../../../src/index.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';
import WizardService from '../../../../src/app/service/wizard/WizardService.js';
import SetResolverAndFactoryService from '../../../../src/app/service/configuration/SetResolverAndFactoryService.js';

describe('wizardService', () => {
  const configurationMock = {
    defaultNetwork: 'testnet',
    networks: [
      { name: 'dev', chainId: 1, consensusNodes: [] },
      { name: 'testnet', chainId: 2, consensusNodes: [] },
    ],
    accounts: [
      {
        accountId: 'account1',
        type: AccountType.SelfCustodial,
        selfCustodial: {
          privateKey: { key: 'key', type: 'type' },
        },
        network: 'testnet',
        alias: 'alias1',
      },
      {
        accountId: 'account2',
        type: AccountType.Fireblocks,
        network: 'testnet',
        alias: 'alias2',
        nonCustodial: {
          fireblocks: {
            apiSecretKeyPath: 'apiSecretKeyPath',
            apiKey: 'apiKey',
            baseUrl: 'baseUrl',
            assetId: 'assetId',
            vaultAccountId: 'vaultAccountId',
            hederaAccountPublicKey: 'hederaAccountPublicKey',
          },
        },
      },
      {
        accountId: '0.0.4',
        type: AccountType.MultiSignature,
        network: 'testnet',
        alias: 'aliasmulti-signature',
        importedTokens: [{ id: '0.0.58325', symbol: 'TEST' }],
      },
      {
        accountId: 'account3',
        type: AccountType.Dfns,
        network: 'testnet',
        alias: 'alias3',
        nonCustodial: {
          dfns: {
            authorizationToken: 'authorizationToken',
            credentialId: 'credentialId',
            privateKeyPath: 'privateKeyPath',
            appOrigin: 'appOrigin',
            appId: 'appId',
            testUrl: 'testUrl',
            walletId: 'walletId',
            hederaAccountPublicKey: 'hederaAccountPublicKey',
            hederaAccountKeyType: 'hederaAccountKeyType',
          },
        },
      },
    ],
    rpcs: [
      {
        name: 'rpc-1',
        network: 'dev',
        baseUrl: 'https://dev.rpcnetwork.com',
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
        selected: true,
      },
    ],
    backend: {
      endpoint: 'http://localhost:3000/api/transactions',
    },
    factories: [
      { id: '1', network: 'dev' },
      { id: '2', network: 'testnet' },
    ],
    resolvers: [
      { id: '1', network: 'dev' },
      { id: '2', network: 'testnet' },
    ],
    mirrors: [
      {
        name: 'mirror-1',
        network: 'dev',
        baseUrl: 'https://dev.mirrornode.com',
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
        selected: true,
      },
    ],
  };

  const mocks: Record<string, jest.SpyInstance> = {};

  beforeAll(() => {
    mocks.cleanAndShowBanner = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle the configuration menu options', async () => {
    // mocks
    const configurationMenuMock = jest
      .spyOn(wizardService, 'configurationMenu')
      .mockImplementation();

    // method call
    await wizardService.configurationMenu();

    // verify
    expect(wizardService).not.toBeNull();
    expect(configurationMenuMock).toHaveBeenCalledTimes(1);
  });

  it('should handle the main menu options', async () => {
    // mocks
    const mainMenuMock = jest
      .spyOn(wizardService, 'mainMenu')
      .mockImplementation();

    // method call
    await wizardService.mainMenu();

    // verify
    expect(wizardService).not.toBeNull();
    expect(mainMenuMock).toHaveBeenCalledTimes(1);
  });

  it('should choose an account and call mainMenu', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('account1 - alias1');
    const setSelectedAccountMock = jest
      .spyOn(wizardService, 'setSelectedAccount')
      .mockImplementation();
    const mainMenuMock = jest
      .spyOn(wizardService, 'mainMenu')
      .mockImplementation();

    // method call
    await wizardService.chooseAccount();

    // verify
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(setSelectedAccountMock).toHaveBeenCalledWith('account1 - alias1');
    expect(mainMenuMock).toHaveBeenCalledTimes(1);
  });

  it('should choose an account, log accounts not found, and call mainMenu', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('account3 - alias3');
    const setSelectedAccountMock = jest
      .spyOn(wizardService, 'setSelectedAccount')
      .mockImplementation();
    const mainMenuMock = jest
      .spyOn(wizardService, 'mainMenu')
      .mockImplementation();
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();

    // method call
    await wizardService.chooseAccount(true, 'dev');

    // verify
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(setSelectedAccountMock).toHaveBeenCalledWith('account3 - alias3');
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledWith(expect.any(String));
    expect(mainMenuMock).toHaveBeenCalledTimes(1);
  });

  it('should choose an account without calling mainMenu', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('account2 - alias2');
    const setSelectedAccountMock = jest
      .spyOn(wizardService, 'setSelectedAccount')
      .mockImplementation();
    const mainMenuMock = jest
      .spyOn(wizardService, 'mainMenu')
      .mockImplementation();

    // method call
    await wizardService.chooseAccount(false);

    // verify
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(setSelectedAccountMock).toHaveBeenCalledWith('account2 - alias2');
    expect(mainMenuMock).not.toHaveBeenCalled();
  });

  it('should choose the last account', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setSelectedAccountMock = jest
      .spyOn(wizardService, 'setSelectedAccount')
      .mockImplementation();

    // method call
    await wizardService.chooseLastAccount();

    // verify
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(setSelectedAccountMock).toHaveBeenCalledWith(
      configurationMock.accounts[configurationMock.accounts.length - 1],
    );
  });

  it('should set the selected account and related configurations', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    const setCurrentAccountMock = jest
      .spyOn(utilsService, 'setCurrentAccount')
      .mockImplementation();
    const setCurrentNetworkMock = jest
      .spyOn(utilsService, 'setCurrentNetwotk')
      .mockImplementation();
    const setCurrentMirrorMock = jest
      .spyOn(utilsService, 'setCurrentMirror')
      .mockImplementation();
    const setCurrentRPCMock = jest
      .spyOn(utilsService, 'setCurrentRPC')
      .mockImplementation();
    const setCurrentBackendMock = jest
      .spyOn(utilsService, 'setCurrentBackend')
      .mockImplementation();
    const setCurrentFactoryAndResolverMock = jest
      .spyOn(utilsService, 'setCurrentResolverAndFactory')
      .mockImplementation();
    const setNetworkMock = jest
      .spyOn(Network, 'setNetwork')
      .mockImplementation();

    // method call
    await wizardService.setSelectedAccount('account2 - alias2');

    // verify
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(setCurrentAccountMock).toHaveBeenCalledWith({
      accountId: 'account2',
      type: AccountType.Fireblocks,
      network: 'testnet',
      alias: 'alias2',
      nonCustodial: {
        fireblocks: {
          apiSecretKeyPath: 'apiSecretKeyPath',
          apiKey: 'apiKey',
          baseUrl: 'baseUrl',
          assetId: 'assetId',
          vaultAccountId: 'vaultAccountId',
          hederaAccountPublicKey: 'hederaAccountPublicKey',
        },
      },
    });
    expect(setCurrentNetworkMock).toHaveBeenCalledWith({
      name: 'testnet',
      chainId: 2,
      consensusNodes: [],
    });
    expect(setCurrentMirrorMock).toHaveBeenCalledWith({
      name: 'mirror-2',
      network: 'testnet',
      baseUrl: 'https://testnet.mirrornode.com',
      apiKey: '',
      headerName: '',
      selected: true,
    });
    expect(setCurrentRPCMock).toHaveBeenCalledWith({
      name: 'rpc-2',
      network: 'testnet',
      baseUrl: 'https://testnet.rpcnetwork.com',
      apiKey: '',
      headerName: '',
      selected: true,
    });
    expect(setCurrentBackendMock).toHaveBeenCalledWith({
      endpoint: configurationMock.backend.endpoint,
    });
    expect(setCurrentFactoryAndResolverMock).toHaveBeenCalledWith(
      {
        id: '2',
        network: 'testnet',
      },
      { id: '2', network: 'testnet' },
    );
    expect(setNetworkMock).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should configure factories and resolvers', async () => {
    // mocks
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(configurationMock.accounts[0]);
    jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue(configurationMock.mirrors[0]);
    jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue(configurationMock.rpcs[0]);
    jest
      .spyOn(utilsService, 'getCurrentBackend')
      .mockReturnValue(configurationMock.backend);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.mainOptions.Configuration'),
      )
      .mockResolvedValueOnce(
        language.getText('wizard.changeOptions.ManageFactoryAndResolver'),
      )
      .mockResolvedValueOnce(language.getText('wizard.changeOptions.Return'))
      .mockResolvedValueOnce(language.getText('wizard.mainOptions.Exit'));

    let keep = (WizardService.prototype as any).configurationMenu;
    jest
      .spyOn(WizardService.prototype as any, 'configurationMenu')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    const configureResolversAndFactoriesMock = jest
      .spyOn(
        SetResolverAndFactoryService.prototype,
        'configureResolversAndFactories',
      )
      .mockResolvedValue([
        configurationMock.factories,
        configurationMock.resolvers,
      ]);

    keep = (WizardService.prototype as any).mainMenu;
    jest
      .spyOn(WizardService.prototype as any, 'mainMenu')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    // act
    await wizardService.mainMenu();

    // asserts
    expect(configureResolversAndFactoriesMock).toHaveBeenCalledTimes(1);
  });
});
