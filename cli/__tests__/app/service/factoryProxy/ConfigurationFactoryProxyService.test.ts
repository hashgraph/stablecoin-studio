import { ContractId, HederaId, Proxy } from '@hashgraph-dev/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ConfigurationFactoryProxyService from '../../../../src/app/service/factoryProxy/ConfigurationFactoryProxyService.js';

describe('configurationFactoryProxyService', () => {
  const factoryProxyConfigurationMock = {
    implementationAddress: new ContractId('0.0.123456'),
    owner: HederaId.from('0.0.234567'),
    pendingOwner: HederaId.from('0.0.234567'),
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
    expect(result.implementationAddress).toBe(
      factoryProxyConfigurationMock.implementationAddress,
    );
    expect(result.owner).toBe(factoryProxyConfigurationMock.owner);
    expect(result.pendingOwner).toBe(
      factoryProxyConfigurationMock.pendingOwner,
    );
  });
});
