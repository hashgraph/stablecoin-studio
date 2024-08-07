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

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  Proxy,
  GetProxyConfigRequest,
  ProxyConfigurationViewModel,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Create Stablecoin Service
 */
export default class ConfigurationProxyService extends Service {
  constructor() {
    super('Proxy Configuration');
  }

  public async getProxyconfiguration(
    tokenId: string,
  ): Promise<ProxyConfigurationViewModel> {
    let proxyConfig: ProxyConfigurationViewModel;

    const spinnerCommand = Proxy.getProxyConfig(
      new GetProxyConfigRequest({
        tokenId,
      }),
    ).then((response) => (proxyConfig = response));
    const spinnerOptions = {
      text: language.getText('state.loading'),
      successText: language.getText('state.proxyConfigCompleted') + '\n',
    };

    await utilsService.showSpinner(spinnerCommand, spinnerOptions);

    return proxyConfig;
  }
}
