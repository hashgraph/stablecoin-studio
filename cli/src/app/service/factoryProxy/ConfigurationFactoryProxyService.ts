import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  Proxy,
  GetFactoryProxyConfigRequest,
  ProxyConfigurationViewModel,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Create Stablecoin Service
 */
export default class ConfigurationFactoryProxyService extends Service {
  constructor() {
    super('Factory Proxy Configuration');
  }

  public async getFactoryProxyconfiguration(
    id: string,
  ): Promise<ProxyConfigurationViewModel> {
    let proxyConfig: ProxyConfigurationViewModel;

    await utilsService.showSpinner(
      Proxy.getFactoryProxyConfig(
        new GetFactoryProxyConfigRequest({
          factoryId: id,
        }),
      ).then((response) => (proxyConfig = response)),
      {
        text: language.getText('state.loading'),
      },
    );

    return proxyConfig;
  }
}
