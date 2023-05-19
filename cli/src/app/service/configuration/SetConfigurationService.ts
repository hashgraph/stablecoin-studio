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
} from '@hashgraph-dev/stablecoin-npm-sdk';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from 'domain/configuration/interfaces/IRPCsConfig.js';
const colors = require('colors');

/**
 * Set Configuration Service
 */
export default class SetConfigurationService extends Service {
  constructor() {
    super('Set Configuration');
  }
  private ZERO_ADDRESS = '0.0.0';
  private HEDERA_MIRROR_NODE_NAME = 'HEDERA';
  private HEDERA_MIRROR_NODE_TESTNET_URL =
    'https://testnet.mirrornode.hedera.com/api/v1/';
  private HEDERA_MIRROR_NODE_PREVIEWNET_URL =
    'https://previewnet.mirrornode.hedera.com/api/v1/';
  private HEDERA_MIRROR_NODE_MAINNET_URL =
    'https://mainnet-public.mirrornode.hedera.com/api/v1/';
  private HEDERA_RPC_NAME = 'HASHIO';
  private HASHIO_RPC_TESTNET_URL =
    'https://testnet.hashio.io/api';
  private HASHIO_RPC_PREVIEWNET_URL =
    'https://previewnet.hashio.io/api';
  private HASHIO_RPC_MAINNET_URL =
    'https://mainnet.hashio.io/api';


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
        await this.configureMirrors();
        
        utilsService.showMessage(
          language.getText('configuration.RPCsConfigurationMessage'),
        );          
        await this.configureRPCs();
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
    mirrors.push(this.getDefaultMirrorByNetwork('testnet'));
    mirrors.push(this.getDefaultMirrorByNetwork('previewnet'));
    mirrors.push(this.getDefaultMirrorByNetwork('mainnet'));
    const rpcs: IMirrorsConfig[] = [];
    rpcs.push(this.getDefaultRPCByNetwork('testnet'));
    rpcs.push(this.getDefaultRPCByNetwork('previewnet'));
    rpcs.push(this.getDefaultRPCByNetwork('mainnet'));
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.mirrors = mirrors;
    defaultCfgData.rpcs = rpcs;
    configurationService.setConfiguration(defaultCfgData);
  }

  private getDefaultMirrorByNetwork(network: string): IMirrorsConfig {
    return {
      name: this.HEDERA_MIRROR_NODE_NAME,
      network: network,
      baseUrl: network === 'testnet'
        ? this.HEDERA_MIRROR_NODE_TESTNET_URL
        : network === 'previewnet'
        ? this.HEDERA_MIRROR_NODE_PREVIEWNET_URL
        : network === 'mainnet'
        ? this.HEDERA_MIRROR_NODE_MAINNET_URL
        : this.HEDERA_MIRROR_NODE_TESTNET_URL,
      apiKey: undefined,
      headerName: undefined,
      selected: true,
    };
  }

  private getDefaultRPCByNetwork(network: string): IRPCsConfig {
    return {
      name: this.HEDERA_RPC_NAME,
      network: network,
      baseUrl: network === 'testnet'
        ? this.HASHIO_RPC_TESTNET_URL
        : network === 'previewnet'
        ? this.HASHIO_RPC_PREVIEWNET_URL
        : network === 'mainnet'
        ? this.HASHIO_RPC_MAINNET_URL
        : this.HASHIO_RPC_TESTNET_URL,
      apiKey: undefined,
      headerName: undefined,
      selected: true,
    };
  }

  public async configureMirrors(): Promise<IMirrorsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const mirrors: IMirrorsConfig[] = [];

    let moreMirrors = true;

    while (moreMirrors) {
      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askMirrorNetwork'),
        configuration.networks.map((acc) => acc.name),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMirrorName'),
        this.HEDERA_MIRROR_NODE_NAME,
      );
      while (
        mirrors.filter(
          (element) => element.network === network && element.name === name,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedMirrorName'));
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorName'),
          this.HEDERA_MIRROR_NODE_NAME,
        );
      }

      let base_url = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMirrorUrl'),
        network === 'testnet'
          ? this.HEDERA_MIRROR_NODE_TESTNET_URL
          : network === 'previewnet'
          ? this.HEDERA_MIRROR_NODE_PREVIEWNET_URL
          : network === 'mainnet'
          ? this.HEDERA_MIRROR_NODE_MAINNET_URL
          : this.HEDERA_MIRROR_NODE_TESTNET_URL,
      );
      while (
        !/^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(
          base_url,
        )
      ) {
        console.log(language.getText('validations.wrongFormatUrl'));
        base_url = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorUrl'),
          network === 'testnet'
            ? this.HEDERA_MIRROR_NODE_TESTNET_URL
            : network === 'previewnet'
            ? this.HEDERA_MIRROR_NODE_PREVIEWNET_URL
            : network === 'mainnet'
            ? this.HEDERA_MIRROR_NODE_MAINNET_URL
            : this.HEDERA_MIRROR_NODE_TESTNET_URL,
        );
      }
      while (
        mirrors.filter(
          (element) =>
            element.network === network && element.baseUrl === base_url,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedMirrorUrl'));
        base_url = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorUrl'),
          network === 'testnet'
            ? this.HEDERA_MIRROR_NODE_TESTNET_URL
            : network === 'previewnet'
            ? this.HEDERA_MIRROR_NODE_PREVIEWNET_URL
            : network === 'mainnet'
            ? this.HEDERA_MIRROR_NODE_MAINNET_URL
            : this.HEDERA_MIRROR_NODE_TESTNET_URL,
        );
      }

      const mirror = {
        name: name,
        network: network,
        baseUrl: base_url.slice(-1) === '/' ? base_url : base_url + '/',
        apiKey: undefined,
        headerName: undefined,
        selected: false,
      };

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askMirrorHasApiKey'),
          true,
        )
      ) {
        mirror.apiKey = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorApiKey'),
          undefined,
        );

        mirror.headerName = await utilsService.defaultSingleAsk(
          language.getText('configuration.askMirrorHeaderName'),
          undefined,
        );
      }

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askMirrorSelected'),
          true,
        )
      ) {
        mirror.selected = true;
        mirrors
          .filter(
            (element) =>
              element.network === mirror.network && element.selected === true,
          )
          .forEach((found) => {
            found.selected = false;
          });
      }

      mirrors.push(mirror);

      const response = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreMirrors'),
        true,
      );
      if (!response) {
        moreMirrors = false;
      }
    }

    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.mirrors = mirrors;
    configurationService.setConfiguration(defaultCfgData);
    return mirrors;
  }

  public async configureRPCs(): Promise<IRPCsConfig[]> {
    const configuration = configurationService.getConfiguration();
    const rpcs: IRPCsConfig[] = [];

    let moreRPCs = true;

    while (moreRPCs) {
      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askRPCNetwork'),
        configuration.networks.map((acc) => acc.name),
      );

      let name = await utilsService.defaultSingleAsk(
        language.getText('configuration.askRPCName'),
        this.HEDERA_RPC_NAME,
      );
      while (
        rpcs.filter(
          (element) => element.network === network && element.name === name,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedRPCName'));
        name = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCName'),
          this.HEDERA_RPC_NAME,
        );
      }

      let base_url = await utilsService.defaultSingleAsk(
        language.getText('configuration.askRPCUrl'),
        network === 'testnet'
        ? this.HASHIO_RPC_TESTNET_URL
        : network === 'previewnet'
        ? this.HASHIO_RPC_PREVIEWNET_URL
        : network === 'mainnet'
        ? this.HASHIO_RPC_MAINNET_URL
        : this.HASHIO_RPC_TESTNET_URL
      );
      while (
        !/^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(
          base_url,
        )
      ) {
        console.log(language.getText('validations.wrongFormatUrl'));
        base_url = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCUrl'),
          network === 'testnet'
            ? this.HASHIO_RPC_TESTNET_URL
            : network === 'previewnet'
            ? this.HASHIO_RPC_PREVIEWNET_URL
            : network === 'mainnet'
            ? this.HASHIO_RPC_MAINNET_URL
            : this.HASHIO_RPC_TESTNET_URL
        );
      }
      while (
        rpcs.filter(
          (element) =>
            element.network === network && element.baseUrl === base_url,
        ).length > 0
      ) {
        console.log(language.getText('validations.duplicatedRPCUrl'));
        base_url = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCUrl'),
          network === 'testnet'
          ? this.HASHIO_RPC_TESTNET_URL
          : network === 'previewnet'
          ? this.HASHIO_RPC_PREVIEWNET_URL
          : network === 'mainnet'
          ? this.HASHIO_RPC_MAINNET_URL
          : this.HASHIO_RPC_TESTNET_URL
        );
      }

      const rpc = {
        name: name,
        network: network,
        baseUrl: base_url.slice(-1) === '/' ? base_url : base_url + '/',
        apiKey: undefined,
        headerName: undefined,
        selected: false,
      };

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askRPCHasApiKey'),
          true,
        )
      ) {
        rpc.apiKey = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCApiKey'),
          undefined,
        );

        rpc.headerName = await utilsService.defaultSingleAsk(
          language.getText('configuration.askRPCHeaderName'),
          undefined,
        );
      }

      if (
        await utilsService.defaultConfirmAsk(
          language.getText('configuration.askRPCSelected'),
          true,
        )
      ) {
        rpc.selected = true;
        rpcs
          .filter(
            (element) =>
              element.network === rpc.network && element.selected === true,
          )
          .forEach((found) => {
            found.selected = false;
          });
      }

      rpcs.push(rpc);

      const response = await utilsService.defaultConfirmAsk(
        language.getText('configuration.askMoreRPCs'),
        true,
      );
      if (!response) {
        moreRPCs = false;
      }
    }

    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.rpcs = rpcs;
    configurationService.setConfiguration(defaultCfgData);
    return rpcs;
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
      currentAccount.network,
      `${currentAccount.accountId} - ${currentAccount.alias}`,
    );
    switch (accountAction) {
      case language.getText('wizard.manageAccountOptions.Change'):
        await utilsService.cleanAndShowBanner();

        await wizardService.chooseAccount(false);
        await utilsService.initSDK();
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
