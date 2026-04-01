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

import { DEFAULT_BACKEND_ENDPOINT } from '../../../../src/core/Constants.js';
import {
  backendConfigurationService,
  configurationService,
  language,
  utilsService,
  wizardService,
} from '../../../../src/index.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType.js';

const CONFIG: IConfiguration = {
  defaultNetwork: 'testnet',
  networks: [
    {
      name: 'testnet',
      chainId: 1,
      consensusNodes: [],
    },
  ],
  accounts: [
    {
      accountId: '0.0.123456',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: 'testnet',
      alias: 'test',
      importedTokens: [],
    },
  ],
  logs: {
    path: './logs',
    level: 'ERROR',
  },
  rpcs: [
    {
      name: 'HASHIO',
      network: 'testnet',
      baseUrl: 'https://testnet.hashio.io/api',
      apiKey: '',
      headerName: '',
      selected: true,
    },
  ],
  backend: {
    endpoint: 'http://test.net:666/api',
  },
  factories: [
    {
      id: '0.0.13579',
      network: 'testnet',
    },
    {
      id: '0.0.02468',
      network: 'previewnet',
    },
  ],
  resolvers: [
    {
      id: '0.0.13579',
      network: 'testnet',
    },
    {
      id: '0.0.02468',
      network: 'previewnet',
    },
  ],
  mirrors: [
    {
      name: 'HEDERA',
      network: 'testnet',
      baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
      apiKey: '',
      headerName: '',
      selected: true,
    },
  ],
};
describe('Backend Configuration Service', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configure Backend', () => {
    it('should configure backend with parameter', async () => {
      //* 🗂️ Arrange
      const ENDPOINT = 'http://test.param:1111/api';
      const EXPECTED_CONFIG = { ...CONFIG, backend: { endpoint: ENDPOINT } };
      const mocks = {
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValueOnce(CONFIG),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
      };
      //* 🎬 Act
      const result = await backendConfigurationService.configureBackend({
        endpoint: ENDPOINT,
      });

      //* 🕵️ Assert
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith(EXPECTED_CONFIG);
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith(
        EXPECTED_CONFIG.backend,
      );
      expect(result).not.toBeNull();
      expect(result.endpoint).toBe(ENDPOINT);
    });

    it('should configure backend using terminal', async () => {
      //* 🗂️ Arrange
      const BAD_ENDPOINT = 'badUrl';
      const ENDPOINT = 'http://test.terminal:2222/api';
      const CONFIG_WITHOUT_BACKEND = { ...CONFIG, backend: undefined };
      const EXPECTED_CONFIG = { ...CONFIG, backend: { endpoint: ENDPOINT } };
      const mocks = {
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValue(CONFIG_WITHOUT_BACKEND),
        defaultSingleAsk: jest
          .spyOn(utilsService, 'defaultSingleAsk')
          .mockReturnValueOnce(Promise.resolve(BAD_ENDPOINT))
          .mockReturnValueOnce(Promise.resolve(ENDPOINT)),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
      };
      //* 🎬 Act
      const result = await backendConfigurationService.configureBackend();

      //* 🕵️ Assert
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(2);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith(EXPECTED_CONFIG);
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith(
        EXPECTED_CONFIG.backend,
      );
      expect(result).not.toBeNull();
      expect(result.endpoint).toBe(ENDPOINT);
    });

    it('should configure backend using configuration', async () => {
      //* 🗂️ Arrange
      const BAD_ENDPOINT = 'badUrl';
      const mocks = {
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValue(CONFIG),
        defaultSingleAsk: jest
          .spyOn(utilsService, 'defaultSingleAsk')
          .mockReturnValue(Promise.resolve(BAD_ENDPOINT)),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
      };
      //* 🎬 Act
      const result = await backendConfigurationService.configureBackend();

      //* 🕵️ Assert
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(5);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith(CONFIG);
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith(CONFIG.backend);
      expect(result).not.toBeNull();
      expect(result.endpoint).toBe(CONFIG.backend.endpoint);
    });

    it('should configure backend using default', async () => {
      //* 🗂️ Arrange
      const BAD_ENDPOINT = 'badUrl';
      const EXPECTED_CONFIG = {
        ...CONFIG,
        backend: { endpoint: DEFAULT_BACKEND_ENDPOINT },
      };
      const CONFIG_WITHOUT_BACKEND = { ...CONFIG, backend: undefined };
      const mocks = {
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValue(CONFIG_WITHOUT_BACKEND),
        defaultSingleAsk: jest
          .spyOn(utilsService, 'defaultSingleAsk')
          .mockReturnValue(Promise.resolve(BAD_ENDPOINT)),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
      };
      //* 🎬 Act
      const result = await backendConfigurationService.configureBackend();

      //* 🕵️ Assert
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(5);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith(EXPECTED_CONFIG);
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith(
        EXPECTED_CONFIG.backend,
      );
      expect(result).not.toBeNull();
      expect(result.endpoint).toBe(EXPECTED_CONFIG.backend.endpoint);
    });
  });

  describe('Manage Backend Menu', () => {
    it('should update backend', async () => {
      //* 🗂️ Arrange
      const ENDPOINT = 'http://test.menu:3333/api';
      const MENU_OPTIONS = language.getArrayFromObject(
        'wizard.manageBackendOptions',
      );
      const mocks = {
        cleanAndShowBanner: jest
          .spyOn(utilsService, 'cleanAndShowBanner')
          .mockReturnValue(Promise.resolve()),
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValue(CONFIG),
        defaultMultipleAsk: jest
          .spyOn(utilsService, 'defaultMultipleAsk')
          .mockReturnValueOnce(Promise.resolve(MENU_OPTIONS[0])),
        defaultSingleAsk: jest
          .spyOn(utilsService, 'defaultSingleAsk')
          .mockReturnValue(Promise.resolve(ENDPOINT)),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
        configurationMenu: jest
          .spyOn(wizardService, 'configurationMenu')
          .mockReturnValue(Promise.resolve()),
      };
      //* 🎬 Act
      await backendConfigurationService.manageBackendMenu({
        options: { clear: true },
      });

      //* 🕵️ Assert
      expect(mocks.cleanAndShowBanner).toHaveBeenCalledTimes(1);
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(2);
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.configurationMenu).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith({
        ...CONFIG,
        backend: { endpoint: ENDPOINT },
      });
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith({
        endpoint: ENDPOINT,
      });
    });
    it('should remove backend', async () => {
      //* 🗂️ Arrange
      const MENU_OPTIONS = language.getArrayFromObject(
        'wizard.manageBackendOptions',
      );
      const mocks = {
        cleanAndShowBanner: jest
          .spyOn(utilsService, 'cleanAndShowBanner')
          .mockReturnValue(Promise.resolve()),
        getConfiguration: jest
          .spyOn(configurationService, 'getConfiguration')
          .mockReturnValue(CONFIG),
        defaultMultipleAsk: jest
          .spyOn(utilsService, 'defaultMultipleAsk')
          .mockReturnValueOnce(Promise.resolve(MENU_OPTIONS[1])),
        setConfiguration: jest
          .spyOn(configurationService, 'setConfiguration')
          .mockReturnValue(),
        setCurrentBackend: jest
          .spyOn(utilsService, 'setCurrentBackend')
          .mockReturnValue(),
        configurationMenu: jest
          .spyOn(wizardService, 'configurationMenu')
          .mockReturnValue(Promise.resolve()),
      };
      //* 🎬 Act
      await backendConfigurationService.manageBackendMenu();

      //* 🕵️ Assert
      expect(mocks.cleanAndShowBanner).toHaveBeenCalledTimes(0);
      expect(mocks.getConfiguration).toHaveBeenCalledTimes(2);
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setCurrentBackend).toHaveBeenCalledTimes(1);
      expect(mocks.configurationMenu).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith({
        ...CONFIG,
        backend: undefined,
      });
      expect(mocks.setCurrentBackend).toHaveBeenCalledWith(undefined);
    });
  });
});
