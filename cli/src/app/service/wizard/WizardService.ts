import {
  configurationService,
  language,
  utilsService,
} from '../../../index.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import Service from '../Service.js';
import CreateStableCoinService from '../stablecoin/CreateStableCoinService.js';
import OperationStableCoinService from '../stablecoin/OperationStableCoinService.js';
import ListStableCoinsService from '../stablecoin/ListStableCoinsService.js';

/**
 * Wizard Service
 */
export default class WizardService extends Service {
  private setConfigurationService: SetConfigurationService;

  constructor() {
    super('Wizard');
  }

  /**
   * Show the wizard main menu
   */
  public async mainMenu(): Promise<void> {
    const wizardMainOptions: Array<string> =
      language.getArray('wizard.mainOptions');

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.mainMenuTitle'),
        wizardMainOptions,
      )
    ) {
      case wizardMainOptions[0]:
        await new CreateStableCoinService().createStableCoin(undefined, true);
        break;
      case wizardMainOptions[1]:
        await new OperationStableCoinService().start();
        break;
      case wizardMainOptions[2]:
        await new ListStableCoinsService().listStableCoins();
        break;
      case wizardMainOptions[3]:
        this.setConfigurationService = new SetConfigurationService();
        await this.configurationMenu();
        break;
      case wizardMainOptions[wizardMainOptions.length - 1]:
      default:
        process.exit();
    }

    utilsService.showMessage(language.getText('general.newLine'));
    await this.mainMenu();
  }

  /**
   * Show configuration menu
   */
  private async configurationMenu(): Promise<void> {
    const wizardChangeConfigOptions: Array<string> = language.getArray(
      'wizard.changeOptions',
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.configurationMenuTitle'),
        wizardChangeConfigOptions,
      )
    ) {
      case wizardChangeConfigOptions[0]:
        await configurationService.showFullConfiguration();
        break;
      case wizardChangeConfigOptions[1]:
        await this.setConfigurationService.configurePath();
        utilsService.showMessage(language.getText('wizard.pathChanged'));
        break;
      case wizardChangeConfigOptions[2]:
        await this.setConfigurationService.configureDefaultNetwork();
        utilsService.showMessage(language.getText('wizard.networkChanged'));
        break;
      case wizardChangeConfigOptions[3]:
        await this.setConfigurationService.configureAccounts();
        utilsService.showMessage(language.getText('wizard.accountsChanged'));
        break;
      case wizardChangeConfigOptions[wizardChangeConfigOptions.length - 1]:
      default:
        await this.mainMenu();
    }

    await this.configurationMenu();
  }
}
