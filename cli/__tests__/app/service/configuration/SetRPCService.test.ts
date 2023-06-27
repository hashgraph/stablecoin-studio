import {
  configurationService,
  setRPCService,
  utilsService,
} from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import { IRPCsConfig } from '../../../../src/domain/configuration/interfaces/IRPCsConfig.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';

const language: Language = new Language();

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

  it('should configure rpc service', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askName'):
            return Promise.resolve('LOCAL');

          case language.getText('configuration.askBaseUrl'):
            return Promise.resolve('https://127.0.0.1:2746/api');

          case language.getText('configuration.askApiKey'):
            return Promise.resolve('');

          case language.getText('configuration.askHeaderName'):
            return Promise.resolve('');

          default:
            return Promise.resolve('');
        }
      });

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
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
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(2);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
    expect(rpcsConfig).not.toBeNull();
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
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(4);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(6);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
