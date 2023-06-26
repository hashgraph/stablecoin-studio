import {
  setFactoryService,
  utilsService,
  configurationService,
} from '../../../../src/index.js';
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig.js';
import { IMirrorsConfig } from '../../../../src/domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from '../../../../src/domain/configuration/interfaces/IRPCsConfig.js';
import { IFactoryConfig } from '../../../../src/domain/configuration/interfaces/IFactoryConfig.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import Language from '../../../../src/domain/language/Language.js';
import {
  ProxyConfigurationViewModel,
  Proxy,
} from '@hashgraph-dev/stablecoin-npm-sdk';

const language: Language = new Language();

describe('setFactoryService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const configurationMock: IConfiguration = {
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
        privateKey: {
          key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
          type: 'ED25519',
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
      {
        name: 'HASHIO',
        network: 'previewnet',
        baseUrl: 'https://previewnet.hashio.io/api',
        apiKey: '',
        headerName: '',
        selected: true,
      },
      {
        name: 'HASHIO',
        network: 'mainnet',
        baseUrl: 'https://mainnet.hashio.io/api',
        apiKey: '',
        headerName: '',
        selected: true,
      },
    ],
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
    mirrors: [
      {
        name: 'HEDERA',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
        apiKey: '',
        headerName: '',
        selected: true,
      },
      {
        name: 'HEDERA',
        network: 'previewnet',
        baseUrl: 'https://previewnet.mirrornode.hedera.com/api/v1/',
        apiKey: '',
        headerName: '',
        selected: true,
      },
      {
        name: 'HEDERA',
        network: 'mainnet',
        baseUrl: 'https://mainnet-public.mirrornode.hedera.com/api/v1/',
        apiKey: '',
        headerName: '',
        selected: true,
      },
    ],
  };

  const account: IAccountConfig = {
    accountId: '0.0.123456',
    privateKey: {
      key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
      type: 'ED25519',
    },
    network: 'testnet',
    alias: 'test',
    importedTokens: [],
  };

  const mirror: IMirrorsConfig = {
    name: 'HEDERA',
    network: 'testnet',
    baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
    apiKey: '',
    headerName: '',
    selected: true,
  };

  const rpc: IRPCsConfig = {
    name: 'HASHIO',
    network: 'testnet',
    baseUrl: 'https://testnet.hashio.io/api',
    apiKey: '',
    headerName: '',
    selected: true,
  };

  const factory: IFactoryConfig = {
    id: '0.0.13579',
    network: 'testnet',
  };

  const factoryProxy: ProxyConfigurationViewModel = {
    implementationAddress: '0.0.345678',
    owner: '0.0.123456',
  };

  it('should manage factory menu', async () => {
    // mocks
    jest.spyOn(console, 'log');

    const accountConfigMock = jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(account);

    const mirrorConfigMock = jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue(mirror);

    const rpcConfigMock = jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue(rpc);

    const factoryConfigMock = jest
      .spyOn(utilsService, 'getCurrentFactory')
      .mockReturnValue(factory);

    const factoryProxyConfigMock = jest
      .spyOn(Proxy, 'getFactoryProxyConfig')
      .mockImplementation(() => Promise.resolve(factoryProxy));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve('Factory details'))
      .mockImplementationOnce(() => Promise.resolve('Change factory'))
      .mockImplementationOnce(() => Promise.resolve('Upgrade factory'))
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('wizard.networkManage'):
            return Promise.resolve('testnet');

          default:
            return Promise.resolve('');
        }
      });

    const cleanAndShowBannerMock = jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation(() => Promise.resolve());

    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askNewFactoryAddress'):
            return Promise.resolve('0.0.98765');

          case language.getText('wizard.askFactoryImplementation'):
            return Promise.resolve('0.0.87654');

          default:
            return Promise.resolve('');
        }
      });

    /* const defaultSingleAskMock = jest
        .spyOn(utilsService, 'defaultSingleAsk')
        .mockImplementation(() => Promise.resolve('0.0.98765')); */

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(accountConfigMock).toHaveBeenCalledTimes(1);
    expect(mirrorConfigMock).toHaveBeenCalledTimes(1);
    expect(rpcConfigMock).toHaveBeenCalledTimes(1);
    expect(factoryConfigMock).toHaveBeenCalledTimes(1);
    expect(factoryProxyConfigMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
    // expect(cleanAndShowBannerMock).toBeCalledTimes(0);
    expect(getConfigurationMock).toHaveBeenCalledTimes(0);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
