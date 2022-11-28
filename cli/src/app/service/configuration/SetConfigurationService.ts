import {
  configurationService,
  language,
  utilsService,
  wizardService,
} from '../../../index.js';
import Service from '../Service.js';
import fs from 'fs-extra';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { IConsensusNodeConfig } from '../../../domain/configuration/interfaces/IConsensusNodeConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IFactoryConfig } from 'domain/configuration/interfaces/IFactoryConfig.js';
import {
  FactoryAddressTestnet,
  FactoryAddressPreviewnet
} from 'hedera-stable-coin-sdk';
const colors = require('colors');

/**
 * Set Configuration Service
 */
export default class SetConfigurationService extends Service {
  constructor() {
    super('Set Configuration');
  }

  /**
   * Initialise the configuration for first time or with "init" command
   */
  public async initConfiguration(
    path?: string,
    network?: string,
  ): Promise<void> {
    utilsService.showMessage(language.getText('initialConfiguration.title'));
    await this.configurePath(path);
    await this.configureDefaultNetwork(network);
    await this.configureAccounts();
    await this.configureFactories();
  }

  /**
   * Function to configure the default path, fails if the path doesn't exist
   */
  public async configurePath(path?: string): Promise<string> {
    let defaultPath: string;
    if (path) {
      defaultPath = path;
    } else {
      defaultPath = await utilsService.defaultSingleAsk(
        language.getText('configuration.askPath'),
        configurationService.getDefaultConfigurationPath(),
      );
    }
    // If the path is incorrect
    if (
      !fs.existsSync(defaultPath) ||
      !configurationService.validateConfigurationFile()
    ) {
      const createAuto = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askCreateConfig'),
        true,
      );
      if (!createAuto) {
        utilsService.exitApplication(
          language.getText('configuration.askCreateConfigNeg'),
        );
      } else {
        configurationService.createDefaultConfiguration(defaultPath);
      }
    }

    // Set default path
    const defaultCfgData = configurationService.getConfiguration();
    configurationService.setConfiguration(defaultCfgData, defaultPath);
    return defaultPath;
  }

  /**
   * Function to configure the default network
   */
  public async configureDefaultNetwork(_network?: string): Promise<string> {
    const networks = configurationService
      .getConfiguration()
      .networks.map((network) => network.name);
    let network: string;
    if (_network) {
      network = _network;
    } else {
      network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askNetwork'),
        networks,
      );
    }

    if (
      network === undefined ||
      network === '' ||
      network === 'mainnet|previewnet|testnet|local'
    ) {
      utilsService.showError(language.getText('general.incorrectParam'));
      network = await this.configureDefaultNetwork();
    }

    // If not mainnet or previewnet or testnet, try to create a new one
    if (
      network !== 'mainnet' &&
      network !== 'previewnet' &&
      network !== 'testnet' &&
      network !== 'local'
    ) {
      const response = await utilsService.defaultSingleAsk(
        language.getText('configuration.askNotDefaultNetwork'),
        'y',
      );

      if (response === 'y' || response === 'yes') {
        await this.configureCustomNetwork(network);
      } else {
        network = await this.configureDefaultNetwork();
      }
    }

    // Set a default network
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.defaultNetwork = network;
    configurationService.setConfiguration(defaultCfgData);
    return network;
  }

  /**
   * Function to configure the account id
   */
  public async configureAccounts(): Promise<IAccountConfig[]> {
    const configuration = configurationService.getConfiguration();
    let accounts: IAccountConfig[] = configuration?.accounts || [];
    if (accounts.length === 1 && accounts[0].privateKey.key === '') {
      accounts = [];
    }
    let moreAccounts = true;

    while (moreAccounts) {
      utilsService.showMessage(`Account:`);

      let accountId = await utilsService.defaultSingleAsk(
        language.getText('configuration.askAccountId'),
        '0.0.0',
      );
      while (!/\d\.\d\.\d/.test(accountId)) {
        console.log(language.getText('validations.wrongFormatAddress'));
        accountId = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAccountId'),
          '0.0.0',
        );
      }

      const accountFromPrivKey: IAccountConfig =
        await this.askForPrivateKeyOfAccount(accountId);

      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askNetworkAccount'),
        configuration.networks.map((acc) => acc.name),
      );

      let alias = await utilsService.defaultSingleAsk(
        language.getText('configuration.askAlias'),
        'AdminAccount',
      );
      while (accounts.some((account) => account.alias === alias)) {
        utilsService.showError(
          language.getText('configuration.aliasAlreadyInUse', {
            alias,
          }),
        );
        alias = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAlias'),
          'AdminAccount',
        );
      }
      accounts.push({
        accountId: accountId,
        privateKey: accountFromPrivKey.privateKey,
        network: network,
        alias: alias,
        importedTokens: [],
      });

      const response = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreAccounts'),
        true,
      );
      if (!response) {
        moreAccounts = false;
      }
    }

    // Set accounts
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.accounts = accounts;
    configurationService.setConfiguration(defaultCfgData);
    return accounts;
  }

  public async configureFactories(): Promise<IFactoryConfig[]> {
    const factories: IFactoryConfig[] = [];
    factories.push({
      id: FactoryAddressTestnet,
      network: "testnet"
    });
    factories.push({
      id: FactoryAddressPreviewnet,
      network: "previewnet"
    });

    // Set a default factories
    const defaultCfgData = configurationService.getConfiguration();
    configurationService.setConfiguration(defaultCfgData);
    return factories;
  }

  public async manageAccountMenu(): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const manageOptions = language.getArray('wizard.manageAccountOptions');
    const defaultCfgData = configurationService.getConfiguration();
    const accounts = defaultCfgData.accounts;
    const accountAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.accountOptions'),
      manageOptions,
      false,
      currentAccount.network,
      `${currentAccount.accountId} - ${currentAccount.alias}`,
    );
    switch (accountAction) {
      case manageOptions[0]:
        await utilsService.cleanAndShowBanner();

        await wizardService.chooseAccount(false);
        await utilsService.initSDK(utilsService.getCurrentNetwork().name);
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
        break;
      case manageOptions[1]:
        await utilsService.cleanAndShowBanner();

        console.dir(utilsService.maskPrivateAccounts(accounts), {
          depth: null,
        });
        break;
      case manageOptions[2]:
        await utilsService.cleanAndShowBanner();

        await this.configureAccounts();
        const operateWithNewAccount = await utilsService.defaultConfirmAsk(
          language.getText('configuration.askOperateWithNewAccount'),
          true,
        );
        if (operateWithNewAccount) {
          await wizardService.chooseLastAccount();
          await utilsService.initSDK(utilsService.getCurrentNetwork().name);
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        }
        break;
      case manageOptions[3]:
        await utilsService.cleanAndShowBanner();

        const options = accounts
          .filter(
            (acc) =>
              acc.accountId !== currentAccount.accountId ||
              acc.alias !== currentAccount.alias,
          )
          .map(
            (acc) =>
              `${acc.accountId} - ${acc.alias}` +
              colors.magenta(' (' + acc.network + ')'),
          );
        const optionsWithoutColors = accounts
          .filter(
            (acc) =>
              acc.accountId !== currentAccount.accountId ||
              acc.alias !== currentAccount.alias,
          )
          .map(
            (acc) =>
              `${acc.accountId} - ${acc.alias}` + ' (' + acc.network + ')',
          );
        let account = await utilsService.defaultMultipleAsk(
          language.getText('wizard.accountDelete'),
          options,
          true,
        );
        if (account === language.getText('wizard.goBack')) {
          await this.manageAccountMenu();
        }
        account = optionsWithoutColors[options.indexOf(account)];
        const accId = account.split(' - ')[0];
        const accAlias = account.split(' - ')[1].split(' ')[0];
        defaultCfgData.accounts = accounts.filter(
          (acc) => acc.accountId !== accId || acc.alias !== accAlias,
        );
        configurationService.setConfiguration(defaultCfgData);
        break;
      case manageOptions[manageOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();

        await wizardService.configurationMenu();
    }
    await this.manageAccountMenu();
  }

  /**
   * Function to configure the private key, fail if length doesn't 96 or 64 or 66
   */
  public async askForPrivateKeyOfAccount(
    accountId: string,
  ): Promise<IAccountConfig> {
    let privateKey = await utilsService.defaultPasswordAsk(
      language.getText('configuration.askPrivateKey') +
        ` '96|64|66 characters' (${accountId})`,
    );

    const pkType = await utilsService.defaultMultipleAsk(
      language.getText('configuration.askPrivateKeyType'),
      language.getArray('wizard.privateKeyType'),
    );

    const network = configurationService.getConfiguration().defaultNetwork;
    let alias = '';

    // Actions by length
    switch (privateKey.length) {
      case 64:
        privateKey = '0x' + privateKey;
        break;
      case 96:
      default:
        break;
    }

    if (
      privateKey.length !== 96 &&
      privateKey.length !== 64 &&
      privateKey.length !== 66
    ) {
      utilsService.showError(language.getText('general.incorrectParam'));
      const acc = await this.askForPrivateKeyOfAccount(accountId);
      privateKey = acc.privateKey.key;
      alias = acc.alias;
    }

    return {
      accountId: accountId,
      privateKey: { key: privateKey, type: pkType },
      network,
      alias: alias,
    };
  }

  /**
   * Function to configure network
   * @param networkName
   * @returns
   */
  public async configureCustomNetwork(
    networkName: string,
  ): Promise<INetworkConfig> {
    const defaultCfgData = configurationService.getConfiguration();
    const consensusNodes: IConsensusNodeConfig[] = [];
    let moreConsensusNodes = true;

    while (moreConsensusNodes) {
      utilsService.showMessage(`Consensus node ${consensusNodes.length + 1}`);

      const consensusNode = await utilsService.defaultSingleAsk(
        language.getText('configuration.askConsensusUrl'),
        '127.0.0.1:50211',
      );
      const nodeId = await utilsService.defaultSingleAsk(
        language.getText('configuration.askNode'),
        '0.0.1',
      );

      consensusNodes.push({ url: consensusNode, nodeId: nodeId });

      const response = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMoreConsensusNodes'),
        'y',
      );
      if (response !== 'y' && response !== 'yes') {
        moreConsensusNodes = false;
      }
    }

    const mirrorUrl = await utilsService.defaultSingleAsk(
      language.getText('configuration.askMirrorNode'),
      'https://tesnet.com',
    );
    const chainId = await utilsService.defaultSingleAsk(
      language.getText('configuration.askChain'),
      '0',
    );

    // Add or remove new network
    defaultCfgData.networks = defaultCfgData.networks.filter(
      (network) => network.name !== networkName,
    );
    const network: INetworkConfig = {
      name: networkName,
      mirrorNodeUrl: mirrorUrl,
      chainId: Number(chainId),
      consensusNodes: consensusNodes,
    };
    defaultCfgData.networks.push(network);

    configurationService.setConfiguration(defaultCfgData);
    utilsService.showMessage('\n');
    return network;
  }
}
