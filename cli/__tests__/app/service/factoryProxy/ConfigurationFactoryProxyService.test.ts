import { Proxy } from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ConfigurationFactoryProxyService from '../../../../src/app/service/factoryProxy/ConfigurationFactoryProxyService.js';

describe('configurationFactoryProxyService', () => {
  const factoryProxyConfigurationMock = {
    implementationAddress: '0.0.123456',
    owner: '0.0.234567',
  };

  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should get the current factory proxy configuration', async () => {
    // mocks
    const getFactoryProxyConfigMock = jest
      .spyOn(Proxy, 'getFactoryProxyConfig')
      .mockImplementation(() => Promise.resolve(factoryProxyConfigurationMock));

    // method call
    const result =
      await new ConfigurationFactoryProxyService().getFactoryProxyconfiguration(
        '0.0.98765',
      );

    // verify
    expect(getFactoryProxyConfigMock).toHaveBeenCalled();
    expect(result.implementationAddress).toBe('0.0.123456');
    expect(result.owner).toBe('0.0.234567');
  });
});
