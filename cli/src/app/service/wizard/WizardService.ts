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
import ManageImportedTokenService from '../stablecoin/ManageImportedTokenService.js';
import ListStableCoinsService from '../stablecoin/ListStableCoinsService.js';
import colors from 'colors';
import { clear } from 'console';
import { IStableCoinDetail } from 'hedera-stable-coin-sdk';

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
    try {
      const wizardMainOptions: Array<string> =
        language.getArray('wizard.mainOptions');
      const currentAccount = utilsService.getCurrentAccount();

      switch (
        await utilsService.defaultMultipleAsk(
          language.getText('wizard.mainMenuTitle'),
          wizardMainOptions,
          false,
          currentAccount.network,
          `${currentAccount.accountId} - ${currentAccount.alias}`,
        )
      ) {
        case wizardMainOptions[0]:
          await utilsService.cleanAndShowBanner();
          const stableCoin: IStableCoinDetail =
            await new CreateStableCoinService().createStableCoin(
              undefined,
              true,
            );
          const operate = await utilsService.defaultConfirmAsk(
            `Do you want to operate with ${stableCoin.name}`,
            true,
          );
          if (operate) {
            await new OperationStableCoinService(
              stableCoin.tokenId,
              stableCoin.memo,
              stableCoin.symbol,
            ).start();
          }
          break;
        case wizardMainOptions[1]:
          await utilsService.cleanAndShowBanner();
          await new ManageImportedTokenService().start();
          break;
        case wizardMainOptions[2]:
          await utilsService.cleanAndShowBanner();
          await new OperationStableCoinService().start();
          break;
        case wizardMainOptions[3]:
          await utilsService.cleanAndShowBanner();
          await new ListStableCoinsService().listStableCoins();
          break;
        case wizardMainOptions[4]:
          await utilsService.cleanAndShowBanner();
          this.setConfigurationService = new SetConfigurationService();
          await this.configurationMenu();
          break;
        case wizardMainOptions[wizardMainOptions.length - 1]:
        default:
          clear();
          process.exit();
      }
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.mainMenu(),
        error,
      );
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
        await utilsService.cleanAndShowBanner();

        await configurationService.showFullConfiguration();
        break;
      case wizardChangeConfigOptions[1]:
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.configurePath();
        utilsService.showMessage(language.getText('wizard.pathChanged'));
        break;
      case wizardChangeConfigOptions[2]:
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.configureDefaultNetwork();
        utilsService.showMessage(language.getText('wizard.networkChanged'));
        break;
      case wizardChangeConfigOptions[3]:
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.manageAccountMenu();
        //utilsService.showMessage(language.getText('wizard.accountsChanged'));
        break;
      case wizardChangeConfigOptions[wizardChangeConfigOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();
        await this.mainMenu();
    }

    await this.configurationMenu();
  }

  public async chooseAccount(mainMenu = true, network?: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { networks, accounts, factories, hederaERC20s } = configuration;
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

    const currentFactory = factories.find(
      (factory) => currentAccount.network === factory.network,
    );

    utilsService.setCurrentFactory(currentFactory);

    const currentHederaERC20 = hederaERC20s.find(
      (hederaERC20) => currentAccount.network === hederaERC20.network,
    );

    utilsService.setCurrentHederaERC20(currentHederaERC20);

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
