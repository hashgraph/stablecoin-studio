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

import colors from 'colors';
import { DEFAULT_BACKEND_ENDPOINT } from '../../../core/Constants';
import {
  configurationService,
  language,
  utilsService,
  wizardService,
} from '../../../index';
import IBackendConfig from '../../../domain/configuration/interfaces/BackendConfig';
import Service from '../Service';

export default class BackendConfigurationService extends Service {
  constructor() {
    super('Backend Configuration');
  }

  public async configureBackend(): Promise<IBackendConfig> {
    const configuration = configurationService.getConfiguration();
    const endpoint = configuration?.backend?.endpoint;
    return this._setBackendEndpoint({ endpoint });
  }

  /**
   * Manages the backend menu based on the provided options.
   *
   * @param options - The options for managing the backend menu.
   * @param options.clean - A boolean indicating whether to clean the terminal and show the banner. Default is false.
   *
   * @returns A Promise that resolves when the backend menu is managed.
   */
  public async manageBackendMenu(
    { options }: { options: { clean?: boolean } } = {
      options: { clean: false },
    },
  ): Promise<void> {
    // Clean the terminal and show the banner
    if (options.clean) {
      await utilsService.cleanAndShowBanner();
    }
    // Get the current account, mirror, rpc to display
    const manageOptions = language.getArrayFromObject(
      'wizard.manageBackendOptions',
    );
    const currentBackend = configurationService.getConfiguration().backend;
    const selectedOption = await utilsService.defaultMultipleAsk(
      language.getText('wizard.manageBackendTitle'),
      manageOptions,
      true,
      {
        backend:
          currentBackend?.endpoint ||
          language.getText('configuration.backendNotDefined'),
      },
    );

    switch (selectedOption) {
      case manageOptions[0]: // Update backend
        const result = await this._setBackendEndpoint();
        console.info(
          colors.green(
            `${language.getText('configuration.backendNew')}: ${
              result.endpoint
            }`,
          ),
        );
        await wizardService.configurationMenu();
        break;
      case manageOptions[1]: // Remove backend
        this._removeBackend();
        console.info(
          colors.green(language.getText('configuration.backendRemoved')),
        );
        await wizardService.configurationMenu();
        break;
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.configurationMenu();
        break;
    }
  }

  private async _setBackendEndpoint({
    endpoint,
  }: { endpoint?: URL | string } = {}): Promise<IBackendConfig> {
    // Try to get the endpoint up to 5 times
    for (let tries = 0; tries < 5; tries++) {
      try {
        const answer = await utilsService.defaultSingleAsk(
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
    const configuration = configurationService.getConfiguration();
    configuration.backend = {
      endpoint: endpoint.toString(),
    } as IBackendConfig;
    configurationService.setConfiguration(configuration);
    utilsService.setCurrentBackend(configuration.backend);
    return configuration.backend;
  }

  private _removeBackend(): void {
    const configuration = configurationService.getConfiguration();
    configuration.backend = undefined;
    configurationService.setConfiguration(configuration);
    utilsService.setCurrentBackend(configuration.backend);
  }
}
