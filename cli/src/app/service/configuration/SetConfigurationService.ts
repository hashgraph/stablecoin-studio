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
import { IFactoryConfig } from '../../../domain/configuration/interfaces/IFactoryConfig.js';
import {
  Network,
  SetConfigurationRequest,
  UpgradeFactoryImplementationRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from 'domain/configuration/interfaces/IRPCsConfig.js';
import ConfigurationFactoryProxyService from '../factoryProxy/ConfigurationFactoryProxyService.js';
import ImplementationFactoryProxyService from '../factoryProxy/ImplementationFactoryProxyService.js';
import { ProxyConfigurationViewModel } from '@hashgraph-dev/stablecoin-npm-sdk';
import { ChangeFactoryProxyOwnerRequest } from '@hashgraph-dev/stablecoin-npm-sdk';
import OwnerFactoryProxyService from '../factoryProxy/OwnerFactoryProxyService.js';
import SetMirrorNodeService from './SetMirrorNodeService.js';
import SetRPCService from './SetRPCService.js';
const colors = require('colors');

/**
 * Set Configuration Service
 */
export default class SetConfigurationService extends Service {

  private mirrorNodeService: SetMirrorNodeService;
  private rpcNodeService: SetRPCService;

  constructor() {
    super('Set Configuration');
  }

  private ZERO_ADDRESS = '0.0.0';

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
    const configFactories = await utilsService.defaultConfirmAsk(
      language.getText('configuration.askConfigurateFactories'),
      true,
    );
    if (configFactories) {
      await this.configureFactories();
    }
    const configDefaultMirrorsAndRPCs = await utilsService.defaultConfirmAsk(
      language.getText('configuration.askConfigurateDefaultMirrorsAndRPCs'),
      true,
    );
    if (configDefaultMirrorsAndRPCs) {
      await this.configureDefaultMirrorsAndRPCs();
    } else {
      utilsService.showMessage(
        language.getText('configuration.MirrorsConfigurationMessage'),
      );
      await this.mirrorNodeService.configureMirrors();

      utilsService.showMessage(
        language.getText('configuration.RPCsConfigurationMessage'),
      );
      await this.rpcNodeService.configureRPCs();
    }
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
      utilsService.showMessage(
        language.getText('configuration.AccountsConfigurationMessage'),
      );

      let accountId = await utilsService.defaultSingleAsk(
        language.getText('configuration.askAccountId'),
        this.ZERO_ADDRESS,
      );
      while (!/\d\.\d\.\d/.test(accountId)) {
        console.log(language.getText('validations.wrongFormatAddress'));
        accountId = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAccountId'),
          this.ZERO_ADDRESS,
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
    let factory_testnet = await utilsService.defaultSingleAsk(
      language.getText('configuration.askFactoryAddress') + ' | TESTNET',
      this.ZERO_ADDRESS,
    );
    while (!/\d\.\d\.\d/.test(factory_testnet)) {
      console.log(language.getText('validations.wrongFormatAddress'));
      factory_testnet = await utilsService.defaultSingleAsk(
        language.getText('configuration.askFactoryAddress') + ' | TESTNET',
        this.ZERO_ADDRESS,
      );
    }
    let factory_previewnet = await utilsService.defaultSingleAsk(
      language.getText('configuration.askFactoryAddress') + ' | PREVIEWNET',
      this.ZERO_ADDRESS,
    );
    while (!/\d\.\d\.\d/.test(factory_previewnet)) {
      console.log(language.getText('validations.wrongFormatAddress'));
      factory_previewnet = await utilsService.defaultSingleAsk(
        language.getText('configuration.askFactoryAddress') + ' | PREVIEWNET',
        this.ZERO_ADDRESS,
      );
    }
    factories.push({
      id: factory_testnet,
      network: 'testnet',
    });
    factories.push({
      id: factory_previewnet,
      network: 'previewnet',
    });

    // Set a default factories
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.factories = factories;
    configurationService.setConfiguration(defaultCfgData);
    return factories;
  }

  public async configureDefaultMirrorsAndRPCs(): Promise<void> {
    const mirrors: IMirrorsConfig[] = [];
    mirrors.push(this.mirrorNodeService.getDefaultMirrorByNetwork('testnet'));
    mirrors.push(this.mirrorNodeService.getDefaultMirrorByNetwork('previewnet'));
    mirrors.push(this.mirrorNodeService.getDefaultMirrorByNetwork('mainnet'));
    const rpcs: IRPCsConfig[] = [];
    rpcs.push(this.rpcNodeService.getDefaultRPCByNetwork('testnet'));
    rpcs.push(this.rpcNodeService.getDefaultRPCByNetwork('previewnet'));
    rpcs.push(this.rpcNodeService.getDefaultRPCByNetwork('mainnet'));
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.mirrors = mirrors;
    defaultCfgData.rpcs = rpcs;
    configurationService.setConfiguration(defaultCfgData);
  }

  public async setSDKFactory(factoryId: string): Promise<void> {
    const req = new SetConfigurationRequest({ factoryAddress: factoryId });
    await Network.setConfig(req);
  }

  public async getSDKFactory(): Promise<string> {
    return await Network.getFactoryAddress();
  }

  public async manageAccountMenu(): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const manageOptions = language.getArrayFromObject(
      'wizard.manageAccountOptions',
    );
    const defaultCfgData = configurationService.getConfiguration();
    const accounts = defaultCfgData.accounts;
    const accountAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.accountOptions'),
      manageOptions,
      false,
      {
        network: currentAccount.network,
        account: `${currentAccount.accountId} - ${currentAccount.alias}`,
      },
    );
    switch (accountAction) {
      case language.getText('wizard.manageAccountOptions.Change'):
        await utilsService.cleanAndShowBanner();

        let sdkInitializeError = true;
        do {
          await wizardService.chooseAccount(false);
          try {
            await utilsService.initSDK();
            sdkInitializeError = false;
          } catch (error) {
            await utilsService.cleanAndShowBanner();
            console.log(
              colors.yellow(
                language.getText('wizard.mirrorNodeNotRespondedAsExpected'),
              ),
            );
          }
        } while (sdkInitializeError);
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
        break;
      case language.getText('wizard.manageAccountOptions.List'):
        await utilsService.cleanAndShowBanner();

        console.dir(utilsService.maskPrivateAccounts(accounts), {
          depth: null,
        });
        break;
      case language.getText('wizard.manageAccountOptions.Add'):
        await utilsService.cleanAndShowBanner();

        await this.configureAccounts();
        const operateWithNewAccount = await utilsService.defaultConfirmAsk(
          language.getText('configuration.askOperateWithNewAccount'),
          true,
        );
        if (operateWithNewAccount) {
          await wizardService.chooseLastAccount();
          await utilsService.initSDK();
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        }
        break;
      case language.getText('wizard.manageAccountOptions.Delete'):
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
        if (account === language.getText('wizard.backOption.goBack')) {
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
      default:
        await utilsService.cleanAndShowBanner();

        await wizardService.configurationMenu();
    }
    await this.manageAccountMenu();
  }

  public async manageFactoryMenu(): Promise<void> {
    const currentAccount = utilsService.getCurrentAccount();
    const currentMirror = utilsService.getCurrentMirror();
    const currentRPC = utilsService.getCurrentRPC();
    const currentFactory = utilsService.getCurrentFactory();

    let factoryProxyConfig;
    try {
      factoryProxyConfig =
        await new ConfigurationFactoryProxyService().getFactoryProxyconfiguration(
          currentFactory.id,
        );
    } catch (Error) {
      factoryProxyConfig = { owner: '0.0.0' };
    }

    const currentImplementation: string =
      factoryProxyConfig.implementationAddress.toString();
    const owner: string = factoryProxyConfig.owner.toString();

    const filteredOptions: string[] = await this.filterManageFactoryOptions(
      language.getArrayFromObject('wizard.manageFactoryOptions'),
      owner,
    );

    const factoryAction = await utilsService.defaultMultipleAsk(
      language.getText('wizard.configurationMenuTitle'),
      filteredOptions,
      false,
      {
        network: currentAccount.network,
        account: `${currentAccount.accountId} - ${currentAccount.alias}`,
        mirrorNode: currentMirror.name,
        rpc: currentRPC.name,
      },
    );
    switch (factoryAction) {
      case language.getText('wizard.manageFactoryOptions.ChangeFactory'):
        await utilsService.cleanAndShowBanner();
        await this.changeFactory();
        utilsService.showMessage(language.getText('wizard.factoryChanged'));
        break;

      case language.getText('wizard.manageFactoryOptions.UpgradeFactory'):
        await utilsService.cleanAndShowBanner();
        await this.upgradeFactory(currentFactory, currentImplementation);
        break;

      case language.getText('wizard.manageFactoryOptions.ChangeOwner'):
        await utilsService.cleanAndShowBanner();
        await this.changeFactoryOwner(currentFactory);
        break;

      case language.getText('wizard.manageFactoryOptions.FactoryDetails'):
        await utilsService.cleanAndShowBanner();
        this.showFactoryDetails(factoryProxyConfig);
        break;

      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.configurationMenu();
    }
    await this.manageFactoryMenu();
  }

  private showFactoryDetails(factoryProxyConfig: ProxyConfigurationViewModel) {
    utilsService.showMessage(
      colors.yellow(
        `${language.getText('factory.implementation')}: ${
          factoryProxyConfig.implementationAddress.value
        }`,
      ),
    );
    utilsService.showMessage(
      colors.yellow(
        `${language.getText('factory.owner')}: ${
          factoryProxyConfig.owner.value
        }`,
      ),
    );
  }

  private async filterManageFactoryOptions(
    options: string[],
    factoryOwner: string,
  ): Promise<string[]> {
    const configAccount = utilsService.getCurrentAccount();

    let filteredOptions: string[] = [];
    filteredOptions = options.filter((option) => {
      if (
        (option ===
          language.getText('wizard.manageFactoryOptions.UpgradeFactory') &&
          factoryOwner !== configAccount.accountId) ||
        (option ===
          language.getText('wizard.manageFactoryOptions.ChangeOwner') &&
          factoryOwner !== configAccount.accountId)
      )
        return false;
      return true;
    });

    return filteredOptions;
  }

  /**
   * Function to change the configured factory
   */
  public async changeFactory(): Promise<IFactoryConfig[]> {
    const configuration = configurationService.getConfiguration();
    const currentAccount = utilsService.getCurrentAccount();
    const currentMirror = utilsService.getCurrentMirror();
    const currentRPC = utilsService.getCurrentRPC();

    const factories: IFactoryConfig[] = configuration?.factories || [];

    const networks = configurationService
      .getConfiguration()
      .networks.map((network) => network.name);
    const network = await utilsService.defaultMultipleAsk(
      language.getText('wizard.networkManage'),
      networks,
      false,
      {
        network: currentAccount.network,
        mirrorNode: currentMirror.name,
        rpc: currentRPC.name,
        account: `${currentAccount.accountId} - ${currentAccount.alias}`,
      },
    );

    const factoryId = await utilsService.defaultSingleAsk(
      language.getText('configuration.askFactoryId'),
      this.ZERO_ADDRESS,
    );

    if (factories && factories.map((val) => val.network)) {
      factories[factories.map((val) => val.network).indexOf(network)].id =
        factoryId;
    } else {
      factories.push({ id: factoryId, network: network });
    }

    // Set factories
    configuration.factories = factories;
    configurationService.setConfiguration(configuration);
    return factories;
  }

  /**
   * Function to upgrade the configured factory
   */
  public async upgradeFactory(
    factory: IFactoryConfig,
    currentImpl: string,
  ): Promise<void> {
    await utilsService.cleanAndShowBanner();

    const upgradeImplementationRequest =
      new UpgradeFactoryImplementationRequest({
        factoryId: factory.id,
        implementationAddress: '',
      });

    try {
      await new ImplementationFactoryProxyService().upgradeImplementation(
        upgradeImplementationRequest,
        currentImpl,
      );
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.manageFactoryMenu(),
        error,
      );
    }
  }

  /**
   * Function to change the owner of the configured factory
   */
  public async changeFactoryOwner(factory: IFactoryConfig): Promise<void> {
    await utilsService.cleanAndShowBanner();

    const changeFactoryProxyOwnerRequest = new ChangeFactoryProxyOwnerRequest({
      factoryId: factory.id,
      targetId: '',
    });

    try {
      await new OwnerFactoryProxyService().changeFactoryProxyOwner(
        changeFactoryProxyOwnerRequest,
      );
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.manageFactoryMenu(),
        error,
      );
    }
  }

  /**
   * Function to configure the private key, fail if length doesn't 96 or 64 or 66
   */
  public async askForPrivateKeyOfAccount(
    accountId: string,
  ): Promise<IAccountConfig> {
    let privateKey = await utilsService.defaultPasswordAsk(
      language.getText('configuration.askPrivateKey') +
        ` '96|64|66|68 characters' (${accountId})`,
    );

    const pkType = await utilsService.defaultMultipleAsk(
      language.getText('configuration.askPrivateKeyType'),
      language.getArrayFromObject('wizard.privateKeyType'),
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
      chainId: Number(chainId),
      consensusNodes: consensusNodes,
    };
    defaultCfgData.networks.push(network);
    configurationService.setConfiguration(defaultCfgData);
    utilsService.showMessage('\n');
    return network;
  }
}
