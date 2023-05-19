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
import {
  Network,
  SetNetworkRequest,
  StableCoinViewModel,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';

/**
 * Wizard Service
 */
export default class WizardService extends Service {
  private setConfigurationService: SetConfigurationService;

  constructor() {
    super('Wizard');
    this.setConfigurationService = new SetConfigurationService();
  }

  /**
   * Show the wizard main menu
   */
  public async mainMenu(): Promise<void> {
    try {
      const wizardMainOptions: Array<string> =
        language.getArrayFromObject('wizard.mainOptions');
      const currentAccount = utilsService.getCurrentAccount();

      switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.mainMenuTitle'),
        wizardMainOptions,
        false,
        {
          network: currentAccount.network,
          account: `${currentAccount.accountId} - ${currentAccount.alias}`,
        }
      )
      ) {
        case language.getText('wizard.mainOptions.Create'):
          await utilsService.cleanAndShowBanner();
          utilsService.displayCurrentUserInfo(currentAccount);
          let configuration = await configurationService.getConfiguration();
          if (
            !configuration.factories.find(
              (item) => item.network === currentAccount.network,
            )
          ) {
            utilsService.showWarning(
              language.getText('stablecoin.noFactories'),
            );
            const configFactories = await utilsService.defaultConfirmAsk(
              language.getText('configuration.askConfigurateFactories'),
              true,
            );
            if (configFactories) {
              await this.setConfigurationService.configureFactories();
              configuration = await configurationService.getConfiguration();
              const { factories } = configuration;
              const currentFactory = factories.find(
                (factory) => currentAccount.network === factory.network,
              );

              utilsService.setCurrentFactory(currentFactory);
            } else {
              break;
            }
          }
          const stableCoin: StableCoinViewModel =
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
              stableCoin.tokenId.toString(),
              stableCoin.proxyAddress.toString(),
              stableCoin.symbol,
            ).start();
          }
          break;
        case language.getText('wizard.mainOptions.Manage'):
          await utilsService.cleanAndShowBanner();
          await new ManageImportedTokenService().start();
          break;
        case language.getText('wizard.mainOptions.Operate'):
          await utilsService.cleanAndShowBanner();
          await new OperationStableCoinService().start();
          break;
        case language.getText('wizard.mainOptions.List'):
          await utilsService.cleanAndShowBanner();
          const resp = await new ListStableCoinsService().listStableCoins(
            false,
          );
          utilsService.drawTableListStableCoin(resp);
          break;
        case language.getText('wizard.mainOptions.Configuration'):
          await utilsService.cleanAndShowBanner();
          await this.configurationMenu();
          break;
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
    const wizardChangeConfigOptions: Array<string> =
      language.getArrayFromObject('wizard.changeOptions');

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.configurationMenuTitle'),
        wizardChangeConfigOptions,
      )
    ) {
      case language.getText('wizard.changeOptions.Show'):
        await utilsService.cleanAndShowBanner();

        await configurationService.showFullConfiguration();
        break;
      case language.getText('wizard.changeOptions.EditPath'):
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.configurePath();
        utilsService.showMessage(language.getText('wizard.pathChanged'));
        break;
      case language.getText('wizard.changeOptions.EditNetwork'):
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.configureDefaultNetwork();
        utilsService.showMessage(language.getText('wizard.networkChanged'));
        break;
      case language.getText('wizard.changeOptions.Manage'):
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.manageAccountMenu();
        break;
      case language.getText('wizard.changeOptions.ManageMirrorNode'):
        await utilsService.cleanAndShowBanner();

        await this.setConfigurationService.configureMirrorNodeNetwork();
        break;
      default:
        await utilsService.cleanAndShowBanner();
        await this.mainMenu();
    }

    await this.configurationMenu();
  }

  public async chooseAccount(mainMenu = true, network?: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { networks, accounts, mirrors, factories } = configuration;
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

    const currentMirror = mirrors.find(
      (mirror) => currentAccount.network === mirror.network && mirror.selected,
    );
    utilsService.setCurrentMirror(currentMirror);

    const currentFactory = factories.find(
      (factory) => currentAccount.network === factory.network,
    );

    utilsService.setCurrentFactory(currentFactory);

    await Network.setNetwork(
      new SetNetworkRequest({
        environment: currentNetwork.name,
        consensusNodes:
          currentNetwork.consensusNodes.length > 0
            ? currentNetwork.name
            : undefined,
        mirrorNode: currentMirror ? currentMirror : undefined,
      }),
    );

    if (mainMenu) await this.mainMenu();
  }

  public async chooseMirrorNodeNetwork(mainMenu = true, _network: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { mirrors } = configuration;

    let selectedMirror: IMirrorsConfig;
    const selectedMirrors = mirrors.filter((mirror) => _network === mirror.network);
    if (selectedMirrors.length > 1) {
      const name = await utilsService.defaultMultipleAsk(
        language.getText('configuration.selectMirrorNode'),
        selectedMirrors.map((mirror) => mirror.name),
        false,
      );
      selectedMirror = selectedMirrors.find((mirror) => name === mirror.name)
    } else {
      selectedMirror = selectedMirrors[0];
    }
    selectedMirror.selected = true;
    utilsService.setCurrentMirror(selectedMirror);

    configuration.mirrors = mirrors;
    configurationService.setConfiguration(configuration);
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

  public async chooseLastMirrorNode(): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { mirrors } = configuration;
    const currentMirror = mirrors[mirrors.length - 1];
    utilsService.setCurrentMirror(currentMirror);
  }
}
