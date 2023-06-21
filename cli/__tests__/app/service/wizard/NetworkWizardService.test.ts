import {
  networkWizardService,
  utilsService,
  configurationService,
} from '../../../../src/index.js';

describe('networkWizardService', () => {
  it('should choose a mirror node network and return true', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue({
        defaultNetwork: 'testnet',
        networks: [],
        accounts: [],
        rpcs: [],
        factories: [],
        mirrors: [
          {
            name: 'testnet-1',
            network: 'testnet',
            baseUrl: 'https://testnet.mirrornode.com',
            apiKey: '',
            headerName: '',
            selected: false,
          },
          {
            name: 'testnet-2',
            network: 'testnet',
            baseUrl: 'https://testnet.mirrornode.com',
            apiKey: '',
            headerName: '',
            selected: false,
          },
        ],
      });
    const setConfigurationMock = jest
      .spyOn(configurationService, 'setConfiguration')
      .mockImplementation();

    const getCurrentMirrorMock = jest
      .spyOn(utilsService, 'getCurrentMirror')
      .mockReturnValue({
        name: 'testnet-1',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.com',
        apiKey: '',
        headerName: '',
        selected: true,
      });
    const setCurrentMirrorMock = jest
      .spyOn(utilsService, 'setCurrentMirror')
      .mockImplementation();
    const showMessageMock = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();
    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValue('testnet-1');

    // method call
    const result = await networkWizardService.chooseMirrorNodeNetwork(
      'testnet',
    );

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(setConfigurationMock).toHaveBeenCalled();
    expect(getCurrentMirrorMock).toHaveBeenCalled();
    expect(setCurrentMirrorMock).toHaveBeenCalled();
    expect(showMessageMock).not.toHaveBeenCalled();
    expect(defaultMultipleAskMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not choose a mirror node network and return false', async () => {
    // mocks
    const getConfigurationMock = jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue({
        defaultNetwork: 'testnet',
        networks: [],
        accounts: [],
        rpcs: [],
        factories: [],
        mirrors: [
          {
            name: 'testnet-1',
            network: 'testnet',
            baseUrl: 'https://testnet.mirrornode.com',
            apiKey: '',
            headerName: '',
            selected: true,
          },
          {
            name: 'testnet-2',
            network: 'testnet',
            baseUrl: 'https://testnet.mirrornode.com',
            apiKey: '',
            headerName: '',
            selected: true,
          },
        ],
      });

    const showMessageMock = jest
      .spyOn(utilsService, 'showMessage')
      .mockImplementation();

    // method call
    const result = await networkWizardService.chooseMirrorNodeNetwork(
      'testnet',
    );

    // verify
    expect(getConfigurationMock).toHaveBeenCalled();
    expect(showMessageMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
