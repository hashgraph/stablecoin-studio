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

import Language from './domain/language/Language.js';
import WizardService from './app/service/wizard/WizardService.js';
import NetworkWizardService from './app/service/wizard/NetworkWizardService.js';
import ConfigurationService from './app/service/configuration/ConfigurationService.js';
import UtilitiesService from './app/service/utilities/UtilitiesService.js';
import CommanderService from './app/service/commander/CommanderService.js';
import SetMirrorNodeService from './app/service/configuration/SetMirrorNodeService.js';
import SetRPCService from './app/service/configuration/SetRPCService.js';
import SetFactoryService from './app/service/configuration/SetFactoryService.js';
import SetConfigurationService from './app/service/configuration/SetConfigurationService.js';
export const language: Language = new Language();
export const wizardService: WizardService = new WizardService();
export const networkWizardService: NetworkWizardService =
  new NetworkWizardService();
export const configurationService: ConfigurationService =
  new ConfigurationService();
export const utilsService: UtilitiesService = new UtilitiesService();
export const commanderService: CommanderService = new CommanderService();
export const setMirrorNodeService: SetMirrorNodeService =
  new SetMirrorNodeService();
export const setRPCService: SetRPCService = new SetRPCService();
export const setFactoryService: SetFactoryService = new SetFactoryService();
export const setConfigurationService: SetConfigurationService =
  new SetConfigurationService();

/**
 * Main function
 */
const main = async (): Promise<void> => {
  // Show initial banner
  await utilsService.showBanner();
  await utilsService.showCostWarningBanner();
  commanderService.start();
};

try {
  if (process.env.JEST === undefined) {
    main();
  }
} catch (error) {
  console.error(error);
}
