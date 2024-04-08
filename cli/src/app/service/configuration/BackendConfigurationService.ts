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

import { DEFAULT_BACKEND_ENDPOINT } from '../../../core/Constants';
import { configurationService, language, utilsService } from '../../../index';
import IBackendConfig from '../../../domain/configuration/interfaces/BackendConfig';
import Service from '../Service';

export default class BackendConfigurationService extends Service {
  constructor() {
    super('Backend Configuration');
  }

  public async configureBackend(): Promise<IBackendConfig> {
    const configuration = configurationService.getConfiguration();
    let endpoint: URL | undefined;

    // Try to get the endpoint up to 5 times
    for (let tries = 0; tries < 5; tries++) {
      try {
        const answer = configuration.backend?.endpoint
          ? configuration.backend.endpoint
          : await utilsService.defaultSingleAsk(
              language.getText('configuration.askBackendUrl'),
              DEFAULT_BACKEND_ENDPOINT,
            );
        endpoint = new URL(answer);
        if (endpoint) break; // If we have a valid endpoint, break the loop
      } catch (error) {
        utilsService.showError(
          `${error}\n${language.getText('general.incorrectParam')}`,
        );
      }
    }

    // If we still don't have a valid endpoint, use the default one
    if (!endpoint) {
      endpoint = new URL(DEFAULT_BACKEND_ENDPOINT);
    }

    // Update the configuration and return it
    configuration.backend = {
      endpoint: endpoint.toString(),
    } as IBackendConfig;
    configurationService.setConfiguration(configuration);
    return configuration.backend;
  }
}
