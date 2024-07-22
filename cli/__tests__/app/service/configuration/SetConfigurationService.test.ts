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
  configurationService,
  setConfigurationService,
  // setMirrorNodeService,
  utilsService,
  wizardService,
} from '../../../../src/index.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import Language from '../../../../src/domain/language/Language.js';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';
import { KeyType } from '../../../../../sdk/build/cjs/src/domain/context/account/KeyProps.js';
import fs from 'fs-extra';

const language: Language = new Language();

const DEFAULT_ACCOUNTS = [
  '0.0.123456',
  '0.0.456789',
  '0.0.654321',
  '0.0.987654',
];
const WRONG_ACCOUNT = 'wrong account id format';
const WRONG_PRIV_KEY = 'wrong private key format';
const DEFAULT_PRIV_KEY =
  'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
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
      type: AccountType.Fireblocks,
      custodial: {
        fireblocks: {
          apiSecretKeyPath: '/user/foo/keystore/key.pem',
          apiKey: 'bbe6a358-0c98-460a-a2fc-91e035f74d54',
          baseUrl: 'https://api.fireblocks.io',
          assetId: 'HBAR_TEST',
          vaultAccountId: '2',
          hederaAccountPublicKey:
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
        },
      },
      network: NETWORKS.test,
      alias: 'New account alias',
      importedTokens: [],
    },
    {
      accountId: DEFAULT_ACCOUNTS[2],
      type: AccountType.Dfns,
      custodial: {
        dfns: {
          authorizationToken: '',
          credentialId: 'Y2ktMTZ2NTMtZXF0ZzAtOWRvOXJub3NjbGI1a3RwYg',
          privateKeyPath: '/user/foo/keystore/key.pem',
          appOrigin: 'https://localhost:3000',
          appId: 'Y2ktMTZ2NTMtZXF0ZzAtOWRvOXJub3NjbGI1a3RwYg',
          testUrl: 'https://api.dfns.ninja/',
          walletId: 'wa-6qfr0-heg0c-985bmvv9hphbok47',
          hederaAccountPublicKey:
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
          hederaAccountKeyType: 'E25519',
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

describe('setConfigurationService', () => {
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
    //! // ConfigurationService cannot be mocked without changing all tests
    // mocks.createDefaultConfiguration = jest
    //   .spyOn(configurationService, 'createDefaultConfiguration')
    //   .mockReturnValue(null);
    // mocks.setConfiguration = jest
    //   .spyOn(configurationService, 'setConfiguration')
    //   .mockReturnValue(null);
    // mocks.getConfiguration = jest
    //   .spyOn(configurationService, 'getConfiguration')
    //   .mockReturnValue(CONFIG_MOCK);
    // Not fixed, only defined
    mocks.defaultSingleAsk = jest.spyOn(utilsService, 'defaultSingleAsk');
    mocks.defaultConfirmAsk = jest.spyOn(utilsService, 'defaultConfirmAsk');
    mocks.defaultMultipleAsk = jest.spyOn(utilsService, 'defaultMultipleAsk');
    mocks.defaultPasswordAsk = jest.spyOn(utilsService, 'defaultPasswordAsk');
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    fs.removeSync(CONFIG_FILE_PATH);
  });

  it('should init configuration with no file path nor network', async () => {
    //* 🗂️ Arrange
    mocks.defaultSingleAsk
      .mockResolvedValueOnce(CONFIG_FILE_PATH)
      .mockResolvedValueOnce(WRONG_ACCOUNT)
      .mockResolvedValueOnce(DEFAULT_ACCOUNTS[0])
      .mockResolvedValueOnce('test account');

    mocks.defaultConfirmAsk.mockImplementation((question: string) => {
      switch (question) {
        case language.getText('configuration.askCreateConfig'):
          return Promise.resolve(true);
        case language.getText('configuration.askMoreAccounts'):
          return Promise.resolve(false);
        case language.getText('configuration.askConfigurateFactories'):
          return Promise.resolve(false);
        case language.getText(
          'configuration.askConfigurateDefaultMirrorsAndRPCs',
        ):
          return Promise.resolve(true);
        case language.getText('configuration.askConfigurateBackend'):
          return Promise.resolve(false);
        default:
          return Promise.resolve(false);
      }
    });
    mocks.defaultMultipleAsk
      .mockResolvedValueOnce(NETWORKS.test)
      .mockResolvedValueOnce(AccountType.SelfCustodial)
      .mockResolvedValueOnce(NETWORKS.test)
      .mockResolvedValueOnce(KeyType.ED25519)
      .mockResolvedValueOnce(KeyType.ED25519);

    mocks.defaultPasswordAsk
      .mockResolvedValueOnce(WRONG_PRIV_KEY)
      .mockResolvedValueOnce(DEFAULT_PRIV_KEY);
    //* 🎬 Act
    await setConfigurationService.initConfiguration();
    //* 🕵️ Assert
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(4);
    expect(mocks.defaultConfirmAsk).toHaveBeenCalledTimes(5);
    expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(5);
    expect(mocks.defaultPasswordAsk).toHaveBeenCalledTimes(2);
  });

  it('should init configuration with file path and network', async () => {
    //* 🗂️ Arrange
    mocks.defaultSingleAsk
      .mockResolvedValueOnce(WRONG_ACCOUNT)
      .mockResolvedValueOnce(DEFAULT_ACCOUNTS[0])
      .mockResolvedValueOnce('test account');

    mocks.defaultConfirmAsk.mockImplementation((question: string) => {
      switch (question) {
        case language.getText('configuration.askCreateConfig'):
          return Promise.resolve(true);
        case language.getText('configuration.askMoreAccounts'):
          return Promise.resolve(false);
        case language.getText('configuration.askConfigurateFactories'):
          return Promise.resolve(false);
        case language.getText(
          'configuration.askConfigurateDefaultMirrorsAndRPCs',
        ):
          return Promise.resolve(true);
        case language.getText('configuration.askConfigurateBackend'):
          return Promise.resolve(false);
        default:
          return Promise.resolve(false);
      }
    });
    mocks.defaultMultipleAsk
      .mockResolvedValueOnce(AccountType.SelfCustodial)
      .mockResolvedValueOnce(NETWORKS.test)
      .mockResolvedValueOnce(KeyType.ED25519)
      .mockResolvedValueOnce(KeyType.ED25519);

    mocks.defaultPasswordAsk
      .mockResolvedValueOnce(WRONG_PRIV_KEY)
      .mockResolvedValueOnce(DEFAULT_PRIV_KEY);
    //* 🎬 Act
    await setConfigurationService.initConfiguration(
      CONFIG_FILE_PATH,
      NETWORKS.test,
    );
    //* 🕵️ Assert
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(3);
    expect(mocks.defaultConfirmAsk).toHaveBeenCalledTimes(5);
    expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(4);
    expect(mocks.defaultPasswordAsk).toHaveBeenCalledTimes(2);
  });

  it('should configure default network', async () => {
    //* 🗂️ Arrange
    //* 🎬 Act
    const result = await setConfigurationService.configureDefaultNetwork(
      NETWORKS.test,
    );
    //* 🕵 Assert
    expect(result).toBe(NETWORKS.test);
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(0);
    expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(0);
  });

  it('should configure custom network from configure default network', async () => {
    //* 🗂️ Arrange
    const CUSTOM_NETWORK = 'Custom Network';
    const configureCustomNetworkM = jest
      .spyOn(setConfigurationService, 'configureCustomNetwork')
      .mockResolvedValue(CONFIG_MOCK.networks[0]);

    mocks.defaultSingleAsk.mockResolvedValue('y');

    mocks.defaultMultipleAsk.mockResolvedValueOnce(CUSTOM_NETWORK);
    // .mockResolvedValueOnce(NETWORKS.test);
    //* 🎬 Act
    const result = await setConfigurationService.configureDefaultNetwork();
    //* 🕵  Assert️
    expect(result).toBe(CUSTOM_NETWORK);
    expect(configureCustomNetworkM).toHaveBeenCalledTimes(1);
    expect(configureCustomNetworkM).toHaveBeenCalledWith(CUSTOM_NETWORK);
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(1);
    expect(mocks.defaultMultipleAsk).toHaveBeenCalledTimes(1);
    //! mock is conflicting with the next test
    configureCustomNetworkM.mockRestore();
  });

  it('should configure custom network', async () => {
    //* 🗂️ Arrange
    mocks.defaultSingleAsk
      .mockResolvedValueOnce('127.0.0.1:50211')
      .mockResolvedValueOnce('0.0.1')
      .mockResolvedValueOnce('n')
      .mockResolvedValueOnce('0');
    //* 🎬 Act
    const result = await setConfigurationService.configureCustomNetwork(
      NETWORKS.test,
    );
    //* 🕵 Assert️
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result.name).toBe(NETWORKS.test);
    expect(result.chainId).toBe(0);
    expect(mocks.defaultSingleAsk).toHaveBeenCalledTimes(4);
  });

  it('should configure default mirrors and RPCs', async () => {
    //* 🗂️ Arrange
    //* 🎬 Act
    await setConfigurationService.configureDefaultMirrorsAndRPCs();
    const result: IConfiguration = configurationService.getConfiguration();
    //* 🕵️ Assert
    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    expect(result.mirrors).toEqual(CONFIG_MOCK.mirrors);
    expect(result.rpcs).toEqual(CONFIG_MOCK.rpcs);
  });

  describe('Account configuration', () => {
    let spy;
    beforeEach(async () => {
      jest
        .spyOn(configurationService, 'getDefaultConfigurationPath')
        .mockReturnValue(CONFIG_FILE_PATH);

      jest
        .spyOn(utilsService, 'getCurrentMirror')
        .mockReturnValue(CONFIG_MOCK.mirrors[0]);

      jest
        .spyOn(utilsService, 'getCurrentRPC')
        .mockReturnValue(CONFIG_MOCK.rpcs[0]);

      jest.spyOn(utilsService, 'initSDK').mockImplementation(jest.fn());

      jest.spyOn(wizardService, 'mainMenu').mockImplementation(jest.fn());
    });
    afterEach(() => {
      spy.mockRestore();
    });

    const buildInitDefaultMultipleAsk = (
      accountType: string,
    ): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultMultipleAsk')
        .mockResolvedValueOnce(
          language.getText('wizard.manageAccountOptions.List'),
        )
        .mockResolvedValueOnce(
          language.getText('wizard.manageAccountOptions.Add'),
        )
        .mockResolvedValueOnce(accountType)
        .mockResolvedValueOnce('testnet');
    };

    const buildDefaultMultipleAskMock = (
      accountType: string,
    ): jest.SpyInstance => {
      const b = buildInitDefaultMultipleAsk(accountType);
      if (accountType !== 'FIREBLOCKS') b.mockResolvedValueOnce('ED25519');
      return b
        .mockResolvedValueOnce(
          language.getText('wizard.manageAccountOptions.Change'),
        )
        .mockResolvedValueOnce('0.0.456789')
        .mockResolvedValueOnce(
          language.getText('wizard.manageAccountOptions.Delete'),
        )
        .mockResolvedValueOnce(
          `0.0.456789 - Account alias ${accountType} (testnet)`,
        );
    };

    const buildDefaultSingleAskMock = (
      accountType: string,
    ): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultSingleAsk')
        .mockImplementationOnce(() => Promise.resolve('0.0.456789'))
        .mockImplementationOnce(() =>
          Promise.resolve(`Account alias ${accountType}`),
        );
    };

    const buildDefaultPasswordAskMock = (): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultPasswordAsk')
        .mockImplementationOnce(() =>
          Promise.resolve(
            'bcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
          ),
        );
    };

    const buildDefaultConfirmAskMock = (): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultConfirmAsk')
        .mockImplementationOnce(() => Promise.resolve(false))
        .mockImplementationOnce(() => Promise.resolve(false));
    };
    it('should manage account menu for self custodial accounts', async () => {
      jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(CONFIG_MOCK.accounts[0]);

      const accountType = 'SELF-CUSTODIAL';
      const defaultMultipleAskMock = buildDefaultMultipleAskMock(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType);
      const defaultPasswordAskMock = buildDefaultPasswordAskMock();
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();

      const keep = setConfigurationService.manageAccountMenu;
      spy = jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(9);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(2);
      expect(defaultPasswordAskMock).toHaveBeenCalledTimes(1);
    });

    it('should manage account menu for non-custodial Firebloks', async () => {
      jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(CONFIG_MOCK.accounts[1]);

      const accountType = 'FIREBLOCKS';
      const defaultMultipleAskMock = buildDefaultMultipleAskMock(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType)
        .mockImplementationOnce(() =>
          Promise.resolve(language.getText('configuration.fireblocks.title')),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('/user/foo/keystore/key.pem'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('bbe6a358-0c98-460a-a2fc-91e035f74d54'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('https://api.fireblocks.io'),
        )
        .mockImplementationOnce(() => Promise.resolve('HBAR_TEST'))
        .mockImplementationOnce(() => Promise.resolve('2'))
        .mockImplementationOnce(() => Promise.resolve('0.0.5712904'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
          ),
        );
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();

      const privateKeyPathValidation = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => true);

      const keep = setConfigurationService.manageAccountMenu;
      spy = jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(8);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(10);
      expect(privateKeyPathValidation).toHaveBeenCalledTimes(1);
    });

    it('should manage account menu for non-custodial Dfns', async () => {
      jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(CONFIG_MOCK.accounts[2]);

      const accountType = 'DFNS';
      const defaultMultipleAskMock = buildDefaultMultipleAskMock(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType)
        .mockImplementationOnce(() =>
          Promise.resolve('Y2ktMTZ2NTMtZXF0ZzAtOWRvOXJub3NjbGI1a3RwYg'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('/user/foo/keystore/key.pem'),
        )
        .mockImplementationOnce(() => Promise.resolve('https://localhost:3000'))
        .mockImplementationOnce(() =>
          Promise.resolve('ap-2ng9jv-80cfc-983pop0iauf2sv8r'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('https://api.dfns.ninja/'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('wa-6qfr0-heg0c-985bmvv9hphbok47'),
        )
        .mockImplementationOnce(() => Promise.resolve('0.0.50000'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
          ),
        );
      const defaultPasswordAskMock = buildDefaultPasswordAskMock();
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();
      const privateKeyPathValidation = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => true);

      const keep = setConfigurationService.manageAccountMenu;
      spy = jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(9);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(10);
      expect(defaultPasswordAskMock).toHaveBeenCalledTimes(1);
      expect(privateKeyPathValidation).toHaveBeenCalledTimes(1);
    });
  });
});
