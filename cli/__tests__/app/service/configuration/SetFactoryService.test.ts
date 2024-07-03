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
  ProxyConfigurationViewModel,
  Proxy,
  ContractId,
  HederaId,
  Network,
} from '@hashgraph/stablecoin-npm-sdk';
import { rimraf } from 'rimraf';
import fs from 'fs-extra';
import {
  setFactoryService,
  utilsService,
  configurationService,
} from '../../../../src/index.js';
import ImplementationFactoryProxyService from '../../../../src/app/service/factoryProxy/ImplementationFactoryProxyService.js';
import SetFactoryService from '../../../../src/app/service/configuration/SetFactoryService.js';
import OwnerFactoryProxyService from '../../../../src/app/service/factoryProxy/OwnerFactoryProxyService.js';
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig.js';
import { IMirrorsConfig } from '../../../../src/domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from '../../../../src/domain/configuration/interfaces/IRPCsConfig.js';
import { IFactoryConfig } from '../../../../src/domain/configuration/interfaces/IFactoryConfig.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import Language from '../../../../src/domain/language/Language.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const language = new Language();

const CONFIG_FILE_PATH = `hsca-config_test.yaml`;
fs.openSync(CONFIG_FILE_PATH, 'w');

const NETWORKS = {
  test: 'testnet',
  preview: 'previewnet',
  main: 'mainnet',
};

const DEFAULT_ACCOUNTS = ['0.0.123456', '0.0.234567', '0.0.345678'];
const DEFAULT_CONTRACT_IDS = [
  '0.0.0',
  '0.0.1',
  '0.0.22',
  '0.0.333',
  '0.0.4444',
  '0.0.55555',
];

const CONFIG_MOCK: IConfiguration = {
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
      selected: true,
    },
    {
      name: 'HASHIO',
      network: 'previewnet',
      baseUrl: 'https://previewnet.hashio.io/api',
      selected: true,
    },
    {
      name: 'HASHIO',
      network: 'mainnet',
      baseUrl: 'https://mainnet.hashio.io/api',
      selected: true,
    },
  ],
  factories: [
    {
      id: DEFAULT_CONTRACT_IDS[1],
      network: 'testnet',
    },
    {
      id: DEFAULT_CONTRACT_IDS[2],
      network: 'previewnet',
    },
  ],
  mirrors: [
    {
      name: 'HEDERA',
      network: 'testnet',
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
      network: 'mainnet',
      baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
      selected: true,
    },
  ],
};

const ACCOUNT: IAccountConfig = {
  accountId: DEFAULT_ACCOUNTS[0],
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
};

const MIRROR: IMirrorsConfig = {
  name: 'HEDERA',
  network: 'testnet',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
  apiKey: '',
  headerName: '',
  selected: true,
};

const RPC: IRPCsConfig = {
  name: 'HASHIO',
  network: 'testnet',
  baseUrl: 'https://testnet.hashio.io/api',
  apiKey: '',
  headerName: '',
  selected: true,
};

const FACTORY: IFactoryConfig = {
  id: DEFAULT_CONTRACT_IDS[1],
  network: 'testnet',
};

const FACTORY_PROXY_CONFIG: ProxyConfigurationViewModel = {
  implementationAddress: new ContractId(DEFAULT_CONTRACT_IDS[1]),
  owner: new HederaId(DEFAULT_ACCOUNTS[0]),
  pendingOwner: new HederaId(DEFAULT_ACCOUNTS[1]),
};

const mocks: Record<string, jest.SpyInstance> = {};

describe('SetFactoryService', () => {
  beforeAll(() => {
    // Mock all unwanted outputs
    mocks.showSpinner = jest
      .spyOn(utilsService, 'showSpinner')
      .mockImplementation();
    mocks.log = jest.spyOn(console, 'log').mockImplementation();
    mocks.info = jest.spyOn(console, 'info').mockImplementation();
    mocks.error = jest.spyOn(console, 'warn').mockImplementation();
    mocks.error = jest.spyOn(console, 'error').mockImplementation();
    mocks.cleanAndShowBanner = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation();
    mocks.showMessage = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();
    mocks.askErrorConfirmation = jest
      .spyOn(utilsService, 'askErrorConfirmation')
      .mockImplementation();
    mocks.getCurrentBackend = jest
      .spyOn(utilsService, 'getCurrentBackend')
      .mockImplementation();
    // Common mocks for all tests
    mocks.configService = jest
      .spyOn(configurationService, 'getDefaultConfigurationPath')
      .mockReturnValue(CONFIG_FILE_PATH);
    mocks.getConfiguration = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(CONFIG_MOCK);
    mocks.getCurrentAccount = jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(ACCOUNT);
    mocks.getCurrentMirror = jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue(MIRROR);
    mocks.getCurrentRpc = jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue(RPC);
    mocks.getCurrentFactory = jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue(FACTORY);
    mocks.getFactoryProxyConfig = jest
      .spyOn(Proxy, 'getFactoryProxyConfig')
      .mockResolvedValue(FACTORY_PROXY_CONFIG);
    // Not fixed, only defined
    mocks.defaultSingleAsk = jest.spyOn(utilsService, 'defaultSingleAsk');
    mocks.defaultMultipleAsk = jest.spyOn(utilsService, 'defaultMultipleAsk');
    mocks.handleValidation = jest.spyOn(utilsService, 'handleValidation');
    mocks.isValidFactory = jest.spyOn(
      SetFactoryService.prototype as any,
      'isValidFactory',
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(CONFIG_FILE_PATH);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should configure factories', async () => {
    //* 🗂️ Arrange
    mocks.defaultSingleAsk
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[3])
      .mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[4]);
    mocks.setConfiguration = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockReturnValue();
    const expectedSetConfigurationRequest: IConfiguration = {
      ...CONFIG_MOCK,
      factories: [
        {
          ...CONFIG_MOCK.factories[0],
          id: DEFAULT_CONTRACT_IDS[3],
        },
        { ...CONFIG_MOCK.factories[1], id: DEFAULT_CONTRACT_IDS[4] },
      ],
    };
    //* 🎬 Act
    const result = await setFactoryService.configureFactories();
    //* 🕵️ Assert
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(2);
    expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
    expect(mocks.setConfiguration).toHaveBeenCalledWith(
      expectedSetConfigurationRequest,
    );
    expect(result).toBeDefined();
    expect(result[0].id).toBe(DEFAULT_CONTRACT_IDS[3]);
    expect(result[1].id).toBe(DEFAULT_CONTRACT_IDS[4]);
    expect(result[0].network).toBe(NETWORKS.test);
    expect(result[1].network).toBe(NETWORKS.preview);
  });

  describe('Manage Factory Menu (manageFactoryMenu)', () => {
    beforeAll(() => {
      // Common mocks
      mocks.isValidFactory.mockReturnValue(true);
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should change the factory', async () => {
      //* 🗂️ Arrange
      mocks.defaultMultipleAsk
        .mockResolvedValueOnce(
          language.getText('wizard.manageFactoryOptions.ChangeFactory'),
        )
        .mockResolvedValueOnce(NETWORKS.test);
      mocks.defaultSingleAsk.mockResolvedValueOnce(DEFAULT_CONTRACT_IDS[3]);
      mocks.setConfiguration = jest
        .spyOn(configurationService, 'setConfiguration')
        .mockReturnValue();
      const expectedSetConfigurationRequest: IConfiguration = {
        ...CONFIG_MOCK,
        factories: [
          {
            ...CONFIG_MOCK.factories[0],
            id: DEFAULT_CONTRACT_IDS[3],
          },
          ...CONFIG_MOCK.factories.slice(1),
        ],
      };
      //* 🎬 Act
      await setFactoryService.manageFactoryMenu({ recursionDepth: 0 });
      //* 🕵️ Assert
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(2);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledTimes(1);
      expect(mocks.setConfiguration).toHaveBeenCalledWith(
        expectedSetConfigurationRequest,
      );
    });

    it('should not change the factory when the new one has an invalid format', async () => {
      //* 🗂️ Arrange
      mocks.defaultMultipleAsk
        .mockResolvedValueOnce(
          language.getText('wizard.manageFactoryOptions.ChangeFactory'),
        )
        .mockResolvedValueOnce(NETWORKS.test);
      mocks.defaultSingleAsk.mockResolvedValue('INVALID');
      //* 🎬 Act
      await setFactoryService.manageFactoryMenu({ recursionDepth: 0 });
      //* 🕵️ Assert
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(2);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(3);
    });

    it('should display factory details', async () => {
      //* 🗂️ Arrange
      mocks.defaultMultipleAsk.mockResolvedValueOnce(
        language.getText('wizard.manageFactoryOptions.FactoryDetails'),
      );
      //* 🎬 Act
      await setFactoryService.manageFactoryMenu({ recursionDepth: 0 });
      //* 🕵️ Assert
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.showMessage).toHaveBeenCalledTimes(2);
    });

    it('should upgrade the factory', async () => {
      //* 🗂️ Arrange
      mocks.defaultMultipleAsk.mockResolvedValueOnce(
        language.getText('wizard.manageFactoryOptions.UpgradeFactory'),
      );
      mocks.upgradeImplementation = jest
        .spyOn(
          ImplementationFactoryProxyService.prototype,
          'upgradeImplementation',
        )
        .mockResolvedValueOnce();
      const expectedUpgradeImplementationRequest = {
        factoryId: FACTORY.id,
        implementationAddress: '',
      };
      //* 🎬 Act
      await setFactoryService.manageFactoryMenu({ recursionDepth: 0 });
      //* 🕵️ Assert
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.upgradeImplementation).toHaveBeenCalledTimes(1);
      expect(mocks.upgradeImplementation).toHaveBeenCalledWith(
        expect.objectContaining(expectedUpgradeImplementationRequest),
        FACTORY_PROXY_CONFIG.implementationAddress.toString(),
      );
      expect(mocks.askErrorConfirmation).toHaveBeenCalledTimes(0);
    });

    it('should change the proxy factory owner', async () => {
      //* 🗂️ Arrange
      mocks.defaultMultipleAsk.mockResolvedValueOnce(
        language.getText('wizard.manageFactoryOptions.ChangeOwner'),
      );
      mocks.defaultSingleAsk.mockResolvedValueOnce(DEFAULT_ACCOUNTS[1]);
      const changeFactoryProxyOwnerMock = jest
        .spyOn(OwnerFactoryProxyService.prototype, 'changeFactoryProxyOwner')
        .mockResolvedValueOnce(null);
      //* 🎬 Act
      await setFactoryService.manageFactoryMenu({ recursionDepth: 0 });
      //* 🕵️ Assert
      expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
      expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(1);
      expect(changeFactoryProxyOwnerMock).toHaveBeenCalledTimes(1);
      expect(changeFactoryProxyOwnerMock).toHaveBeenCalledWith(
        expect.objectContaining({
          factoryId: FACTORY.id,
          targetId: DEFAULT_ACCOUNTS[1],
        }),
      );
      //! Not working
      // expect(changeFactoryProxyOwnerMock).toHaveBeenCalledWith(
      //   expect.objectContaining(changeFactoryProxyOwnerRequest),
      // );
    });
  });
  describe('SDK Factory', () => {
    it('should set SDK factory', async () => {
      //* 🗂️ Arrange
      const setConfigMock = jest
        .spyOn(Network, 'setConfig')
        .mockResolvedValueOnce({ factoryAddress: DEFAULT_CONTRACT_IDS[5] });
      //* 🎬 Act
      await setFactoryService.setSDKFactory(DEFAULT_CONTRACT_IDS[5]);
      //* 🕵️ Assert
      expect(setConfigMock).toHaveBeenCalledTimes(1);
      expect(setConfigMock).toHaveBeenCalledWith(
        expect.objectContaining({ factoryAddress: DEFAULT_CONTRACT_IDS[5] }),
      );
    });

    it('should get SDK factory', async () => {
      //* 🗂️ Arrange
      const getFactoryAddressMock = jest
        .spyOn(Network, 'getFactoryAddress')
        .mockReturnValue(DEFAULT_CONTRACT_IDS[4]);
      //* 🎬 Act
      await setFactoryService.getSDKFactory();
      //* 🕵️ Assert
      expect(getFactoryAddressMock).toHaveBeenCalledTimes(1);
    });
  });
});
