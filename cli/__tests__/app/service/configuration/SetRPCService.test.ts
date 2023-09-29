import {
  configurationService,
  setRPCService,
  utilsService,
  wizardService,
} from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import { IRPCsConfig } from '../../../../src/domain/configuration/interfaces/IRPCsConfig.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import { Network } from '@hashgraph/stablecoin-npm-sdk';
import { rimraf } from 'rimraf';
import fs from 'fs-extra';

const language: Language = new Language();

const configFilePath = `hsca-config_test.yaml`;
fs.openSync(configFilePath, 'w');

describe('setRPCNodeService', () => {
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
    ],
  };

  beforeAll(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest
      .spyOn(configurationService, 'getDefaultConfigurationPath')
      .mockReturnValue(configFilePath);
    jest.spyOn(console, 'log');
  });

  it('should configure rpc service', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('HASHIO'))
      .mockImplementationOnce(() => Promise.resolve('LOCAL'))
      .mockImplementationOnce(() => Promise.resolve('test'))
      .mockImplementationOnce(() =>
        Promise.resolve('https://testnet.hashio.io/api'),
      )
      .mockImplementationOnce(() =>
        Promise.resolve('https://127.0.0.1:2746/api'),
      )
      .mockImplementationOnce(() => Promise.resolve(''))
      .mockImplementationOnce(() => Promise.resolve(''));

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askNeedApiKey'):
            return Promise.resolve(true);

          case language.getText('configuration.askCreateConfig'):
            return Promise.resolve(false);

          case language.getText('configuration.askMoreRPCs'):
            return Promise.resolve(false);

          default:
            return Promise.resolve(false);
        }
      });

    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const rpcsConfig: IRPCsConfig[] = await setRPCService.configureRPC(
      'testnet',
    );

    expect(setRPCService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(7);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
    expect(rpcsConfig).not.toBeNull();
  });

  it('should get default RPC by network', async () => {
    const rpcsConfig: IRPCsConfig =
      setRPCService.getDefaultRPCByNetwork('testnet');

    expect(setRPCService).not.toBeNull();
    expect(rpcsConfig.network).toBe('testnet');
    expect(rpcsConfig.name).toBe('HASHIO');
    expect(rpcsConfig.baseUrl).toBe('https://testnet.hashio.io/api');
    expect(rpcsConfig.apiKey).toBeUndefined();
    expect(rpcsConfig.headerName).toBeUndefined();
    expect(rpcsConfig.selected).toBe(true);
  });

  it('should remove rpc service', async () => {
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue(configurationMock.rpcs[0]);

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementation(() => Promise.resolve('LOCAL (testnet)'));

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation(() => Promise.resolve(true));

    await setRPCService.removeRPC('testnet');

    expect(setRPCService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(3);
  });

  it('should configure rpcs service', async () => {
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementation(() => Promise.resolve('testnet'));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askRPCName'):
            return Promise.resolve('ARKHIA');

          case language.getText('configuration.askRPCUrl'):
            return Promise.resolve(
              'https://starter.arkhia.io/hedera/testnet/api/v1',
            );

          default:
            return Promise.resolve('');
        }
      });

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askRPCHasApiKey'):
            return Promise.resolve(false);

          case language.getText('configuration.askRPCSelected'):
            return Promise.resolve(false);

          case language.getText('configuration.askMoreRPCs'):
            return Promise.resolve(false);

          default:
            return Promise.resolve(false);
        }
      });

    await setRPCService.configureRPCs();

    expect(setRPCService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(2);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(9);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(6);
  });

  it('should manage the rpc node menu', async () => {
    const currentNetworkMock = jest
      .spyOn(utilsService, 'getCurrentNetwork')
      .mockReturnValue(configurationMock.networks[0]);

    const currentAccountMock = jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(configurationMock.accounts[0]);

    const currentMirrorMock = jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue(configurationMock.mirrors[0]);

    const currentRPCMock = jest
      .spyOn(utilsService, 'getCurrentRPC')
      .mockReturnValue(configurationMock.rpcs[0]);

    const networkConnectMock = jest
      .spyOn(Network, 'connect')
      .mockImplementation(() => Promise.resolve({}));

    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const keep = (setRPCService as any).manageRPCMenu;
    jest
      .spyOn(setRPCService as any, 'manageRPCMenu')
      .mockImplementationOnce(keep)
      .mockImplementationOnce(keep)
      .mockImplementationOnce(keep)
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    jest.spyOn(wizardService as any, 'mainMenu').mockImplementation(jest.fn());

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(language.getText('wizard.manageRPCOptions.List')),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(language.getText('wizard.manageRPCOptions.Add')),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(language.getText('wizard.manageRPCOptions.Change')),
      )
      .mockImplementationOnce(() => Promise.resolve('ARKHIA'))
      .mockImplementationOnce(() =>
        Promise.resolve(language.getText('wizard.manageRPCOptions.Delete')),
      );

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation(() => Promise.resolve('TEST'))
      .mockImplementation(() =>
        Promise.resolve('https://test2.io/hedera/testnet/api/v1'),
      );

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementationOnce(() => Promise.resolve(true));

    await setRPCService.manageRPCMenu('testnet');

    expect(setRPCService).not.toBeNull();
    expect(currentNetworkMock).toHaveBeenCalledTimes(2);
    expect(currentAccountMock).toHaveBeenCalledTimes(5);
    expect(currentMirrorMock).toHaveBeenCalledTimes(6);
    expect(currentRPCMock).toHaveBeenCalledTimes(9);
    expect(getConfigurationMock).toHaveBeenCalledTimes(11);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(8);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(13);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(10);
    expect(networkConnectMock).toHaveBeenCalledTimes(1);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    rimraf(configFilePath);
  });
});
