/* eslint-disable no-case-declarations */
import {
  configurationService,
  language,
  utilsService,
} from '../../../index.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';
import SetFactoryService from '../configuration/SetFactoryService.js';
import Service from '../Service.js';
import CreateStableCoinService from '../stablecoin/CreateStableCoinService.js';
import OperationStableCoinService from '../stablecoin/OperationStableCoinService.js';
import ManageImportedTokenService from '../stablecoin/ManageImportedTokenService.js';
import ListStableCoinsService from '../stablecoin/ListStableCoinService.js';
import colors from 'colors';
import { clear } from 'console';
import {
  Network,
  SetNetworkRequest,
  StableCoinViewModel,
} from '@hashgraph/stablecoin-npm-sdk';
import { IAccountConfig } from 'domain/configuration/interfaces/IAccountConfig.js';
import { MIRROR_NODE, RPC } from '../../../core/Constants.js';

/**
 * Wizard Service
 */
export default class WizardService extends Service {
  private setConfigurationService: SetConfigurationService;
  private setFactoryService: SetFactoryService;

  constructor() {
    super('Wizard');
    this.setConfigurationService = new SetConfigurationService();
    this.setFactoryService = new SetFactoryService();
  }

  /**
   * Show the wizard main menu
   */
  public async mainMenu(): Promise<void> {
    try {
      const wizardMainOptions: Array<string> =
        language.getArrayFromObject('wizard.mainOptions');
      const currentAccount = utilsService.getCurrentAccount();
      const currentMirror = utilsService.getCurrentMirror();
      const currentRPC = utilsService.getCurrentRPC();

      switch (
        await utilsService.defaultMultipleAsk(
          language.getText('wizard.mainMenuTitle'),
          wizardMainOptions,
          false,
          {
            network: currentAccount.network,
            mirrorNode: currentMirror.name,
            rpc: currentRPC.name,
            account: `${currentAccount.accountId} - ${currentAccount.alias}`,
          },
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
              await this.setFactoryService.configureFactories();
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
    const configAccount = utilsService.getCurrentAccount();
    const currentMirror = utilsService.getCurrentMirror();
    const currentRPC = utilsService.getCurrentRPC();
    const wizardChangeConfigOptions: Array<string> =
      language.getArrayFromObject('wizard.changeOptions');

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('wizard.configurationMenuTitle'),
        wizardChangeConfigOptions,
        false,
        {
          network: configAccount.network,
          mirrorNode: currentMirror.name,
          rpc: currentRPC.name,
          account: `${configAccount.accountId} - ${configAccount.alias}`,
        },
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
        await utilsService.configureNetwork(MIRROR_NODE);
        break;

      case language.getText('wizard.changeOptions.ManageRPC'):
        await utilsService.cleanAndShowBanner();
        await utilsService.configureNetwork(RPC);
        break;

      case language.getText('wizard.changeOptions.ManageFactory'):
        await utilsService.cleanAndShowBanner();
        await this.setFactoryService.manageFactoryMenu();
        break;

      default:
        await utilsService.cleanAndShowBanner();
        await this.mainMenu();
    }

    await this.configurationMenu();
  }

  public async chooseAccount(mainMenu = true, network?: string): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { accounts } = configuration;
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
      false,
    );

    await this.setSelectedAccount(account);

    if (mainMenu) await this.mainMenu();
  }

  public async chooseLastAccount(): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { accounts } = configuration;
    const currentAccount = accounts[accounts.length - 1];
    await this.setSelectedAccount(currentAccount);
  }

  public async setSelectedAccount(
    account: string | IAccountConfig,
  ): Promise<void> {
    const configuration = configurationService.getConfiguration();
    const { networks, accounts, mirrors, rpcs, factories } = configuration;

    const currentAccount =
      typeof account === 'string'
        ? accounts.find((acc) => acc.accountId === account.split(' - ')[0])
        : account;
    utilsService.setCurrentAccount(currentAccount);

    const currentNetwork = networks.find(
      (network) => currentAccount.network === network.name,
    );
    utilsService.setCurrentNetwotk(currentNetwork);

    const currentMirror = mirrors.find(
      (mirror) => currentAccount.network === mirror.network && mirror.selected,
    );
    utilsService.setCurrentMirror(currentMirror);

    const currentRPC = rpcs.find(
      (rpc) => currentAccount.network === rpc.network && rpc.selected,
    );
    utilsService.setCurrentRPC(currentRPC);

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
        rpcNode: currentRPC ? currentRPC : undefined,
      }),
    );
  }
}
