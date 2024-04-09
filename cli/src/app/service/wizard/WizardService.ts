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

/* eslint-disable no-case-declarations */
import {
  backendConfigurationService,
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
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { MIRROR_NODE, RPC } from '../../../core/Constants.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType.js';
import ManageMultiSigTxService from '../stablecoin/ManageMultiSigTxService.js';

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
      // Retrieve the main options from the language file
      const wizardMainOptions: Array<string> =
        language.getArrayFromObject('wizard.mainOptions');
      const currentAccount = utilsService.getCurrentAccount();
      const currentMirror = utilsService.getCurrentMirror();
      const currentRPC = utilsService.getCurrentRPC();
      const currentBackend = utilsService.getCurrentBackend();

      // Remove ListPendingMultiSig from options if the account is a MultiSig account
      if (currentAccount.type === AccountType.MultiSignature) {
        wizardMainOptions.splice(
          wizardMainOptions.indexOf(
            language.getText('wizard.mainOptions.ListPendingMultiSig'),
          ),
          1,
        );
      }

      // Show the main menu and get the selected option
      const selectedOption = await utilsService.defaultMultipleAsk(
        language.getText('wizard.mainMenuTitle'),
        wizardMainOptions,
        false,
        {
          network: currentAccount.network,
          mirrorNode: currentMirror.name,
          rpc: currentRPC.name,
          backend: currentBackend?.endpoint,
          account: `${currentAccount.accountId} - ${currentAccount.alias}`,
        },
      );
      switch (selectedOption) {
        case language.getText('wizard.mainOptions.Create'):
          await utilsService.cleanAndShowBanner();
          utilsService.displayCurrentUserInfo(currentAccount);
          let configuration = configurationService.getConfiguration();
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
              configuration = configurationService.getConfiguration();
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
        case language.getText('wizard.mainOptions.ListPendingMultiSig'):
          // Continue to MultiSig Submenu
          await new ManageMultiSigTxService().start({
            drawTable: true,
            options: { clear: true },
          });
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
    const currentBackend = utilsService.getCurrentBackend();
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
          backend: currentBackend?.endpoint,
          account: `${configAccount.accountId} - ${configAccount.alias}`,
        },
      )
    ) {
      case language.getText('wizard.changeOptions.Show'):
        await utilsService.cleanAndShowBanner();
        configurationService.showFullConfiguration();
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

      case language.getText('wizard.changeOptions.ManageBackend'):
        await backendConfigurationService.manageBackendMenu({
          options: { clean: true },
        });
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

    utilsService.setCurrentBackend(configuration.backend);

    const currentFactory = factories.find(
      (factory) => currentAccount.network === factory.network,
    );

    utilsService.setCurrentFactory(currentFactory);

    await Network.setNetwork(
      new SetNetworkRequest({
        environment: currentNetwork.name,
        consensusNodes: currentNetwork.consensusNodes,
        mirrorNode: currentMirror ? currentMirror : undefined,
        rpcNode: currentRPC ? currentRPC : undefined,
      }),
    );
  }
}
