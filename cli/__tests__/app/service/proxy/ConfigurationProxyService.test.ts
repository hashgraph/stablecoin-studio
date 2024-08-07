/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ContractId, HederaId, Proxy } from '@hashgraph/stablecoin-npm-sdk';
import { utilsService } from '../../../../src/index.js';
import ConfigurationProxyService from '../../../../src/app/service/proxy/ConfigurationProxyService.js';

describe('configurationProxyService', () => {
  const proxyConfigurationMock = {
    implementationAddress: new ContractId('0.0.123456'),
    owner: HederaId.from('0.0.234567'),
    pendingOwner: HederaId.from('0.0.345678'),
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
    const configurationProxyService = new ConfigurationProxyService();
    const result = await configurationProxyService.getProxyconfiguration(
      '0.0.98765',
    );

    // verify
    expect(getProxyConfigMock).toHaveBeenCalled();
    expect(result.implementationAddress).toBeInstanceOf(ContractId);
    expect(result.implementationAddress.value).toBe(
      proxyConfigurationMock.implementationAddress.value,
    );
    expect(result.owner).toBeInstanceOf(HederaId);
    expect(result.owner.value).toBe(proxyConfigurationMock.owner.value);
    expect(result.pendingOwner).toBeInstanceOf(HederaId);
    expect(result.pendingOwner.value).toBe(
      proxyConfigurationMock.pendingOwner.value,
    );
  });
});
