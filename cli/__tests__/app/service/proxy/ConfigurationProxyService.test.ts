import { Proxy } from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ConfigurationProxyService from '../../../../src/app/service/proxy/ConfigurationProxyService.js';

describe('configurationProxyService', () => {
  const proxyConfigurationMock = {
    implementationAddress: '0.0.123456',
    owner: '0.0.234567',
  };

  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get the current  proxy configuration', async () => {
    // mocks
    const getProxyConfigMock = jest
      .spyOn(Proxy, 'getProxyConfig')
      .mockImplementation(() => Promise.resolve(proxyConfigurationMock));

    // method call
    const result =
      await new ConfigurationProxyService().getProxyconfiguration(
        '0.0.98765',
      );

    // verify
    expect(getProxyConfigMock).toHaveBeenCalled();
    expect(result.implementationAddress).toBe('0.0.123456');
    expect(result.owner).toBe('0.0.234567');
  });
});
