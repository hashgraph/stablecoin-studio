import { Network } from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService, configurationService } from '../../../../src/index.js';

describe('UtilitiesService', () => {
  it('should initialize the SDK and connect to the network', async () => {
    // mocks
    const mockAccount = {
      accountId: 'mockAccountId',
      privateKey: {
        key: 'mockPrivateKey',
        type: 'mockPrivateKeyType',
      },
      network: 'mockNetwork',
      alias: 'mockAlias',
    };

    const mockCurrentNetwork = {
      name: 'mockNetworkName',
    };

    const mockCurrentMirror = {
      name: 'testnet',
      network: 'testnet',
      baseUrl: 'https://testnet.mirrornode.com',
      apiKey: '',
      headerName: '',
      selected: true,
    };
    const mockCurrentRPC = {
      name: 'testnet',
      network: 'testnet',
      baseUrl: 'https://testnet.rpc.com',
      apiKey: '',
      headerName: '',
      selected: true,
    };

    const mockLogConfiguration = {
      level: 'debug',
    };

    const networkInitSpy = jest
      .spyOn(Network, 'init')
      .mockResolvedValue(undefined);
    const networkConnectSpy = jest
      .spyOn(Network, 'connect')
      .mockResolvedValue(undefined);

    configurationService.getLogConfiguration = jest
      .fn()
      .mockReturnValue(mockLogConfiguration);
    utilsService.getCurrentAccount = jest.fn().mockReturnValue(mockAccount);
    utilsService.getCurrentNetwork = jest
      .fn()
      .mockReturnValue(mockCurrentNetwork);
    utilsService.getCurrentMirror = jest
      .fn()
      .mockReturnValue(mockCurrentMirror);
    utilsService.getCurrentRPC = jest.fn().mockReturnValue(mockCurrentRPC);

    // method call
    await utilsService.initSDK();

    // verify
    expect(networkInitSpy).toHaveBeenCalled();
    expect(networkConnectSpy).toHaveBeenCalled();

    // restore mocks
    networkInitSpy.mockRestore();
    networkConnectSpy.mockRestore();
  });
});
