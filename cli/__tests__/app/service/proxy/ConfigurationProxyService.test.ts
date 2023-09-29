import { ContractId, HederaId, Proxy } from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ConfigurationProxyService from '../../../../src/app/service/proxy/ConfigurationProxyService.js';

describe('configurationProxyService', () => {
  const proxyConfigurationMock = {
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

  it('should get the current  proxy configuration', async () => {
    // mocks
    const getProxyConfigMock = jest
      .spyOn(Proxy, 'getProxyConfig')
      .mockImplementation(() => Promise.resolve(proxyConfigurationMock));

    // method call
    const result = await new ConfigurationProxyService().getProxyconfiguration(
      '0.0.98765',
    );

    // verify
    expect(getProxyConfigMock).toHaveBeenCalled();
    expect(result.implementationAddress).toBe(
      proxyConfigurationMock.implementationAddress,
    );
    expect(result.owner).toBe(proxyConfigurationMock.owner);
    expect(result.pendingOwner).toBe(proxyConfigurationMock.pendingOwner);
  });
});
