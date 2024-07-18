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

import { rimraf } from 'rimraf';
import yaml from 'js-yaml';
import fs from 'fs-extra';
import { LogOptions } from '@hashgraph/stablecoin-npm-sdk';
import {
  utilsService,
  configurationService,
  setConfigurationService,
} from '../../../../src/index.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

// const language: Language = new Language();
const DEFAULT_ACCOUNTS = [
  '0.0.123456',
  '0.0.456789',
  '0.0.654321',
  '0.0.987654',
];
const DEFAULT_CONTRACT_IDS = ['0.0.0', '0.0.1', '0.0.22', '0.0.333'];
const NETWORKS = {
  test: 'testnet',
  preview: 'previewnet',
  main: 'mainnet',
};
const CONFIG_FILE_PATH = `hsca-config_test.yaml`;

const CONFIG_MOCK: IConfiguration = {
  defaultNetwork: 'testnet',
  networks: [],
  accounts: [
    {
      accountId: DEFAULT_ACCOUNTS[0],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'test account',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[1],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'New account alias',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[2],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
      alias: 'another test account',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[3],
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
        },
      },
      network: NETWORKS.test,
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
      network: NETWORKS.test,
      baseUrl: 'https://testnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: NETWORKS.preview,
      baseUrl: 'https://previewnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: NETWORKS.main,
      baseUrl: 'https://mainnet.hashio.io/api',
      selected: true,
    },
  ],
  factories: [
    {
      id: DEFAULT_CONTRACT_IDS[0],
      network: NETWORKS.test,
    },
    {
      id: DEFAULT_CONTRACT_IDS[1],
      network: NETWORKS.preview,
    },
  ],
  mirrors: [
    {
      name: 'HEDERA',
      network: NETWORKS.test,
      baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: 'previewnet',
      baseUrl: 'https://previewnet.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
    {
      name: 'HEDERA',
      network: NETWORKS.main,
      baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
  ],
};

const mocks: Record<string, jest.SpyInstance> = {};

describe('Configuration Service', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.showSpinner = jest
      .spyOn(utilsService, 'showSpinner')
      .mockImplementation();
    mocks.log = jest.spyOn(console, 'log').mockImplementation();
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'warn').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    mocks.dir = jest.spyOn(console, 'dir').mockImplementation();
    mocks.cleanAndShowBanner = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation();
    mocks.showMessage = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();
    // Not fixed, only defined
    mocks.getDefaultConfigurationPath = jest.spyOn(
      configurationService,
      'getDefaultConfigurationPath',
    );
  });
  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(CONFIG_FILE_PATH);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('Init configuration', () => {
    beforeAll(() => {
      mocks.getDefaultConfigurationPath.mockReturnValue(CONFIG_FILE_PATH);
      mocks.initConfiguration = jest
        .spyOn(setConfigurationService, 'initConfiguration')
        .mockResolvedValue(null);
      mocks.fsReadFile = jest.spyOn(fs, 'readFileSync').mockReturnValue('');
    });
    it('should init configuration with no initial configuration or a file path', async () => {
      //* 🗂️ Arrange
      mocks.yamlLoad = jest
        .spyOn(yaml, 'load')
        .mockReturnValueOnce({})
        .mockReturnValueOnce(CONFIG_MOCK);
      //* 🎬 Act
      await configurationService.init();
      //* 🕵️ Assert
      expect(mocks.initConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.initConfiguration).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it('should init configuration with path', async () => {
      //* 🗂️ Arrange
      mocks.yamlLoad = jest.spyOn(yaml, 'load').mockReturnValue(CONFIG_MOCK);
      //* 🎬 Act
      await configurationService.init(undefined, CONFIG_FILE_PATH);
      //* 🕵️ Assert
      const config = configurationService.getConfiguration();
      expect(mocks.initConfiguration).toHaveBeenCalledTimes(0);
      expect(config).toStrictEqual(CONFIG_MOCK);
    });
    it('should init configuration with path and override account', async () => {
      //* 🗂️ Arrange
      mocks.yamlLoad = jest.spyOn(yaml, 'load').mockReturnValue(CONFIG_MOCK);
      //* 🎬 Act
      await configurationService.init(
        {
          // Override account id with ZERO account
          accounts: [
            { accountId: DEFAULT_ACCOUNTS[0], ...CONFIG_MOCK.accounts[0] },
          ],
        },
        CONFIG_FILE_PATH,
      );
      //* 🕵️ Assert
      const config = configurationService.getConfiguration();
      expect(mocks.initConfiguration).toHaveBeenCalledTimes(0);
      expect(config.accounts[0].accountId).toStrictEqual(DEFAULT_ACCOUNTS[0]);
    });
  });

  describe('Get Configuration', () => {
    it('should get configuration', async () => {
      //* 🗂️ Arrange
      // init configuration
      mocks.yamlLoad = jest.spyOn(yaml, 'load').mockReturnValue(CONFIG_MOCK);
      await configurationService.init(undefined, CONFIG_FILE_PATH);
      //* 🎬 Act
      const result: IConfiguration = configurationService.getConfiguration();
      //* 🕵️ Assert
      expect(result).toStrictEqual(CONFIG_MOCK);
    });

    it('should get log configuration', async () => {
      //* 🗂️ Arrange
      // init configuration
      mocks.yamlLoad = jest.spyOn(yaml, 'load').mockReturnValue(CONFIG_MOCK);
      await configurationService.init(undefined, CONFIG_FILE_PATH);
      //* 🎬 Act
      const result: LogOptions = configurationService.getLogConfiguration();
      //* 🕵️ Assert
      expect(result.level).toStrictEqual(CONFIG_MOCK.logs.level);
    });
    it('should not get log configuration', async () => {
      //* 🗂️ Arrange
      // init configuration with logs undefined
      mocks.yamlLoad = jest
        .spyOn(yaml, 'load')
        .mockReturnValue({ ...CONFIG_MOCK, logs: undefined });
      await configurationService.init(undefined, CONFIG_FILE_PATH);
      //* 🎬 Act
      const result: LogOptions = configurationService.getLogConfiguration();
      //* 🕵️ Assert
      expect(result).toBeUndefined();
    });
  });

  it('should show full configuration', async () => {
    //* 🗂️ Arrange
    const getConfigM = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(CONFIG_MOCK);
    const consoleDirM = jest.spyOn(console, 'dir');
    //* 🎬 Act
    configurationService.showFullConfiguration();
    //* 🕵️ Assert
    expect(getConfigM).toHaveBeenCalledTimes(1);
    expect(consoleDirM).toHaveBeenCalledTimes(1);
    expect(consoleDirM).toHaveBeenCalledWith(
      expect.objectContaining({ defaultNetwork: CONFIG_MOCK.defaultNetwork }),
      {
        depth: null,
      },
    );
  });

  it('should check the configurated factory id', async () => {
    //* 🗂️ Arrange
    jest.spyOn(utilsService, 'showWarning');
    //* 🎬 Act
    configurationService.logFactoryIdWarning(
      '0.0.13570',
      'factory',
      'testnet',
      [
        {
          id: '0.0.13579',
          network: 'testnet',
        },
      ],
    );
    //* 🕵️ Assert
    expect(utilsService.showWarning).toHaveBeenCalledTimes(1);
  });
});
