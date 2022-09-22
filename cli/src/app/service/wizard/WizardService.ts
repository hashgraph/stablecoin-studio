/* eslint-disable no-case-declarations */
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
import { StableCoin } from '../../../domain/stablecoin/StableCoin.js';
import colors from 'colors';

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
    const currentAccount = utilsService.getCurrentAccount();

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.mainMenuTitle'),
        wizardMainOptions,
        currentAccount.network,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
      )
    ) {
      case wizardMainOptions[0]:
        const stableCoin: StableCoin =
          await new CreateStableCoinService().createStableCoin(undefined, true);
        const operate = await utilsService.defaultConfirmAsk(
          `Do you want to operate with ${stableCoin.name}`,
          true,
        );
        if (operate) {
          await new OperationStableCoinService(
            stableCoin.id,
            stableCoin.memo,
            stableCoin.symbol,
          ).start();
        }
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
  public async configurationMenu(): Promise<void> {
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
        await this.setConfigurationService.manageAccountMenu();
        //utilsService.showMessage(language.getText('wizard.accountsChanged'));
        break;
      case wizardChangeConfigOptions[wizardChangeConfigOptions.length - 1]:
      default:
        await this.mainMenu();
    }

    await this.configurationMenu();
  }

  public async chooseAccount(mainMenu = true, network?: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { networks, accounts } = configuration;
    let options = network
      ? accounts
          .filter((acc) => acc.network === network)
          .map(
            (acc) =>
              `${acc.accountId} - ${acc.alias}` +
              colors.magenta(' (' + acc.network + ')'),
          )
      : accounts.map(
          (acc) =>
            `${acc.accountId} - ${acc.alias}` +
            colors.magenta(' (' + acc.network + ')'),
        );
    if (network && options.length === 0) {
      options = accounts.map(
        (acc) =>
          `${acc.accountId} - ${acc.alias}` +
          colors.magenta(' (' + acc.network + ')'),
      );
      console.log(colors.yellow(language.getText('wizard.accountsNotFound')));
    }
    const account = await utilsService.defaultMultipleAsk(
      language.getText('wizard.accountLogin'),
      options,
    );
    const currentAccount = accounts.find(
      (acc) => acc.accountId === account.split(' - ')[0],
    );
    utilsService.setCurrentAccount(currentAccount);
    const currentNetwork = networks.find(
      (network) => currentAccount.network === network.name,
    );
    utilsService.setCurrentNetwotk(currentNetwork);
    if (mainMenu) await this.mainMenu();
  }

  public async chooseLastAccount(): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { networks, accounts } = configuration;
    const currentAccount = accounts[accounts.length - 1];
    utilsService.setCurrentAccount(currentAccount);
    const currentNetwork = networks.find(
      (network) => currentAccount.network === network.name,
    );
    utilsService.setCurrentNetwotk(currentNetwork);
  }
}
