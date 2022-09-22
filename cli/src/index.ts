#!/usr/bin/env node

import Language from './domain/language/Language.js';
import WizardService from './app/service/wizard/WizardService.js';
import ConfigurationService from './app/service/configuration/ConfigurationService.js';
import UtilitiesService from './app/service/utilities/UtilitiesService.js';
import CommanderService from './app/service/commander/CommanderService.js';

export const language: Language = new Language();
export const wizardService: WizardService = new WizardService();
export const configurationService: ConfigurationService =
  new ConfigurationService();
export const utilsService: UtilitiesService = new UtilitiesService();
export const commanderService: CommanderService = new CommanderService();

/**
 * Main function
 */
const main = async (): Promise<void> => {
  // Show initial banner
  await utilsService.showBanner();
  commanderService.start();
};

try {
  main();
} catch (error) {
  console.error(error);
}
