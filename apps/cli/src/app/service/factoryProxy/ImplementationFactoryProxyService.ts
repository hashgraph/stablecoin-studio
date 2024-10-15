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
  UpgradeFactoryImplementationRequest,
  Proxy,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Factory Proxy Implementation
 */
export default class ImplementationFactoryProxyService extends Service {
  constructor() {
    super('Factory Proxy Implementation');
  }

  /**
   * upgrade the proxy implementation
   */
  public async upgradeImplementation(
    req: UpgradeFactoryImplementationRequest,
    currentImpl: string,
  ): Promise<void> {
    console.log(
      language.getText('proxyConfiguration.currentImplementation') +
        currentImpl,
    );
    await utilsService.handleValidation(
      () => req.validate('implementationAddress'),
      async () => {
        req.implementationAddress = await utilsService.defaultSingleAsk(
          language.getText('wizard.askFactoryImplementation'),
          '0.0.0',
        );
      },
    );

    await utilsService.showSpinner(Proxy.upgradeFactoryImplementation(req), {
      text: language.getText('state.loading'),
      successText:
        language.getText('state.upgradeImplementationCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
