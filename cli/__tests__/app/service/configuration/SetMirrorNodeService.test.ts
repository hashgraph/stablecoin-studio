import {
  configurationService,
  setMirrorNodeService,
  utilsService,
} from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import { IMirrorsConfig } from '../../../../src/domain/configuration/interfaces/IMirrorsConfig.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
// import { Network } from '@hashgraph-dev/stablecoin-npm-sdk';
// import WizardService from '../../../../src/app/service/wizard/WizardService.js';

const language: Language = new Language();

describe('setMirrorNodeService', () => {
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
    jest.spyOn(console, 'log');
  });

  it('should configure mirror node', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('HEDERA'))
      .mockImplementationOnce(() => Promise.resolve('LOCAL'))
      .mockImplementationOnce(() => Promise.resolve('test'))
      .mockImplementationOnce(() =>
        Promise.resolve('https://testnet.mirrornode.hedera.com/api/v1/'),
      )
      .mockImplementationOnce(() =>
        Promise.resolve('https://127.0.0.1:2746/api/'),
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

          case language.getText('configuration.askMoreMirrorNodes'):
            return Promise.resolve(false);

          default:
            return Promise.resolve(false);
        }
      });

    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    const mirrorsConfig: IMirrorsConfig[] =
      await setMirrorNodeService.configureMirrorNode('testnet');

    expect(setMirrorNodeService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(7);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
    expect(mirrorsConfig).not.toBeNull();
  });

  it('should get default mirror by network', async () => {
    const mirrorsConfig: IMirrorsConfig =
      setMirrorNodeService.getDefaultMirrorByNetwork('testnet');

    expect(setMirrorNodeService).not.toBeNull();
    expect(mirrorsConfig.network).toBe('testnet');
    expect(mirrorsConfig.name).toBe('HEDERA');
    expect(mirrorsConfig.baseUrl).toBe(
      'https://testnet.mirrornode.hedera.com/api/v1/',
    );
    expect(mirrorsConfig.apiKey).toBeUndefined();
    expect(mirrorsConfig.headerName).toBeUndefined();
    expect(mirrorsConfig.selected).toBe(true);
  });

  it('should remove mirror node', async () => {
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);

    jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue(configurationMock.mirrors[0]);

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementation(() => Promise.resolve('LOCAL (testnet)'));

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation(() => Promise.resolve(true));

    await setMirrorNodeService.removeMirrorNode('testnet');

    expect(setMirrorNodeService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(3);
  });

  it('should configure mirror nodes', async () => {
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
          case language.getText('configuration.askMirrorName'):
            return Promise.resolve('ARKHIA');

          case language.getText('configuration.askMirrorUrl'):
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
          case language.getText('configuration.askMirrorHasApiKey'):
            return Promise.resolve(false);

          case language.getText('configuration.askMirrorSelected'):
            return Promise.resolve(false);

          case language.getText('configuration.askMoreMirrors'):
            return Promise.resolve(false);

          default:
            return Promise.resolve(false);
        }
      });

    await setMirrorNodeService.configureMirrors();

    expect(setMirrorNodeService).not.toBeNull();
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(2);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(9);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(6);
  });

  /* it('should list mirror nodes', async () => {
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

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() =>
        Promise.resolve(
          language.getText('wizard.manageMirrorNodeOptions.List'),
        ),
      );

    await setMirrorNodeService.manageMirrorNodeMenu('testnet');

    expect(setMirrorNodeService).not.toBeNull();
    expect(currentNetworkMock).toHaveBeenCalledTimes(1);
    expect(currentAccountMock).toHaveBeenCalledTimes(1);
    expect(currentMirrorMock).toHaveBeenCalledTimes(1);
    expect(currentRPCMock).toHaveBeenCalledTimes(1);
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(networkConnectMock).toHaveBeenCalledTimes(1);
  }); */

  /* it('should add mirror nodes', async () => {
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

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve(language.getText('wizard.manageMirrorNodeOptions.Add')))   
      .mockImplementationOnce(() => Promise.resolve(language.getText('wizard.manageMirrorNodeOptions.Change')))           
      .mockImplementationOnce(() => Promise.resolve('ARKHIA2'));
      
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askName'):
            return Promise.resolve('ARKHIA2');

          case language.getText('configuration.askBaseUrl'):
            return Promise.resolve(
              'https://starter.arkhia2.io/hedera/testnet/api/v1',
          );

          default:
            return Promise.resolve('');
        }
    });

    const defaultConfirmAskMock = jest
    .spyOn(utilsService, 'defaultConfirmAsk')
    .mockImplementation((question: string) => {
      switch (question) {
        case language.getText('configuration.askNeedApiKey'):
          return Promise.resolve(false);

        case language.getText('configuration.askOperateWithNewMirrorNode'):
          return Promise.resolve(true);

        default:
          return Promise.resolve(false);
      }
    });
        
    await setMirrorNodeService.manageMirrorNodeMenu('testnet');

    expect(setMirrorNodeService).not.toBeNull();
    expect(currentNetworkMock).toHaveBeenCalledTimes(1);
    expect(currentAccountMock).toHaveBeenCalledTimes(1);
    expect(currentMirrorMock).toHaveBeenCalledTimes(1);
    expect(currentRPCMock).toHaveBeenCalledTimes(1);
    expect(getConfigurationMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(1);
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(1);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(1);
    expect(networkConnectMock).toHaveBeenCalledTimes(1);
  }, 10000); */

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
