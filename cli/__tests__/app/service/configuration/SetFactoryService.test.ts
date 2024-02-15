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
  Network,
} from '@hashgraph/stablecoin-npm-sdk';
import { rimraf } from 'rimraf';
import fs from 'fs-extra';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const language: Language = new Language();

const configFilePath = `hsca-config_test.yaml`;
fs.openSync(configFilePath, 'w');

describe('setFactoryService', () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();

    // mocks
    jest.spyOn(console, 'log');

    jest
      .spyOn(configurationService, 'getDefaultConfigurationPath')
      .mockReturnValue(configFilePath);

    jest.spyOn(utilsService, 'getCurrentAccount').mockReturnValue(account);

    jest.spyOn(utilsService, 'getCurrentMirror').mockReturnValue(mirror);

    jest.spyOn(utilsService, 'getCurrentRPC').mockReturnValue(rpc);

    jest.spyOn(utilsService, 'getCurrentFactory').mockReturnValue(factory);

    jest
      .spyOn(Proxy, 'getFactoryProxyConfig')
      .mockImplementation(() =>
        Promise.resolve({} as ProxyConfigurationViewModel),
      );

    jest
      .spyOn(utilsService, 'cleanAndShowBanner')
      .mockImplementation(() => Promise.resolve());

    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
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

  const account: IAccountConfig = {
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

  it('should configure factories', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('test'))
      .mockImplementationOnce(() => Promise.resolve('0.0.12345'))
      .mockImplementationOnce(() => Promise.resolve('test'))
      .mockImplementationOnce(() => Promise.resolve('0.0.67890'));

    setFactoryService.configureFactories();

    expect(setFactoryService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(1);
  });

  it('should change the factory', async () => {
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageFactoryOptions.ChangeFactory'),
        ),
      )
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation(() => Promise.resolve('0.0.23456'));

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should not change the factory when the new one has an invalid format', async () => {
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageFactoryOptions.ChangeFactory'),
        ),
      )
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation(() => Promise.resolve('test'));

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should display factory details', async () => {
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageFactoryOptions.FactoryDetails'),
        ),
      );

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should upgrade the factory', async () => {
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'upgradeFactoryImplementation')
      .mockImplementation(() => Promise.resolve(true));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageFactoryOptions.UpgradeFactory'),
        ),
      )
      .mockImplementationOnce(() => Promise.resolve(''));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation(() => Promise.resolve('0.0.87654'));

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
    expect(changeFactoryProxyOwnerMock).toHaveBeenCalledTimes(0);
  });

  it('should change the proxy factory owner', async () => {
    const changeFactoryProxyOwnerMock = jest
      .spyOn(Proxy, 'changeFactoryProxyOwner')
      .mockImplementation(() => Promise.resolve(true));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageFactoryOptions.ChangeOwner'),
        ),
      );

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation(() => Promise.resolve('0.0.87654'));

    setFactoryService.manageFactoryMenu();

    expect(setFactoryService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
    expect(changeFactoryProxyOwnerMock).toHaveBeenCalledTimes(0);
  });

  it('should set SDK factory', async () => {
    const setConfigMock = jest
      .spyOn(Network, 'setConfig')
      .mockImplementation(() =>
        Promise.resolve({ factoryAddress: '0.0.12345' }),
      );

    setFactoryService.setSDKFactory('0.0.12345');

    expect(setFactoryService).not.toBeNull();
    expect(setConfigMock).toHaveBeenCalledTimes(1);
  });

  it('should get SDK factory', async () => {
    const getFactoryAddressMock = jest
      .spyOn(Network, 'getFactoryAddress')
      .mockReturnValue('0.0.12345');

    setFactoryService.getSDKFactory();

    expect(setFactoryService).not.toBeNull();
    expect(getFactoryAddressMock).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    rimraf(configFilePath);
  });
});
