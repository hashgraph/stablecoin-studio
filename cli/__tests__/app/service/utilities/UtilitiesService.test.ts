import {
  Network,
  InitializationRequest,
  // ConnectRequest,
  // SupportedWallets,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService, configurationService } from '../../../../src/index.js';
// import UtilitiesService from '../../../../src/app/service/utilities/UtilitiesService';

describe('UtilitiesService', () => {
  // let utilitiesService: UtilitiesService;

  beforeEach(() => {
    // utilitiesService = new UtilitiesService();
  });

  describe('initSDK', () => {
    it('should initialize the SDK and connect to the network', async () => {
      // Mocks
      const mockAccount = {
        accountId: 'mockAccountId',
        privateKey: {
          key: 'mockPrivateKey',
          type: 'mockPrivateKeyType',
        },
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
        baseUrl: 'https://testnet.mirrornode.com',
        apiKey: '',
        headerName: '',
        selected: true,
      };

      const networkInitSpy = jest
        .spyOn(Network, 'init')
        .mockResolvedValue(undefined);
      const networkConnectSpy = jest
        .spyOn(Network, 'connect')
        .mockResolvedValue(undefined);

      // Set up test environment
      // const utilitiesService = new UtilitiesService();
      utilsService.getCurrentAccount = jest.fn().mockReturnValue(mockAccount);
      utilsService.getCurrentNetwork = jest
        .fn()
        .mockReturnValue(mockCurrentNetwork);
      utilsService.getCurrentMirror = jest
        .fn()
        .mockReturnValue(mockCurrentMirror);
      utilsService.getCurrentRPC = jest.fn().mockReturnValue(mockCurrentRPC);

      configurationService.getLogConfiguration = jest
        .fn()
        .mockReturnValue(undefined);

      // Execute the method
      await utilsService.initSDK();

      // Verify the expected behavior
      expect(networkInitSpy).toHaveBeenCalledWith(
        new InitializationRequest({
          network: mockCurrentNetwork.name,
          mirrorNode: mockCurrentMirror,
          rpcNode: mockCurrentRPC,
        }),
      );

      expect(networkConnectSpy).toHaveBeenCalled();

      // Restore the spies
      networkInitSpy.mockRestore();
      networkConnectSpy.mockRestore();
    });
  });
});
