import {
  configurationService,
  language,
  utilsService,
  wizardService,
  setMirrorNodeService,
  setRPCService,
  setFactoryService,
} from '../../../index.js';
import Service from '../Service.js';
import fs from 'fs-extra';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { IConsensusNodeConfig } from '../../../domain/configuration/interfaces/IConsensusNodeConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from 'domain/configuration/interfaces/IRPCsConfig.js';
import { ZERO_ADDRESS } from '../../../core/Constants.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType';
import { IPrivateKey } from '../../../domain/configuration/interfaces/IPrivateKey';
import { IFireblocksAccountConfig } from '../../../domain/configuration/interfaces/IFireblocksAccountConfig';
import { IDfnsAccountConfig } from '../../../domain/configuration/interfaces/IDfnsAccountConfig';
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
   *
   * @param path Path to the configuration file
   * @param network Network to use
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
      await setFactoryService.configureFactories();
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
      await setMirrorNodeService.configureMirrors();

      utilsService.showMessage(
        language.getText('configuration.RPCsConfigurationMessage'),
      );
      await setRPCService.configureRPCs();
    }
  }

  /**
   * Function to configure the default path, fails if the path doesn't exist
   *
   * @param path Path to the configuration file
   *
   * @returns The new path
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
   *
   * @param _network Network to use
   *
   * @returns The new default network
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
   *
   * @returns Accounts
   */
  public async configureAccounts(): Promise<IAccountConfig[]> {
    const configuration = configurationService.getConfiguration();
    let accounts: IAccountConfig[] = configuration?.accounts || [];
    if (
      accounts.length === 1 &&
      ((accounts[0].selfCustodial &&
        accounts[0].selfCustodial.privateKey.key === '') ||
        (accounts[0].nonCustodial &&
          (accounts[0].nonCustodial.fireblocks ||
            accounts[0].nonCustodial.dfns)))
    ) {
      accounts = [];
    }
    let moreAccounts = true;

    while (moreAccounts) {
      utilsService.showMessage(
        language.getText('configuration.AccountsConfigurationMessage'),
      );
      let accountId = await utilsService.defaultSingleAsk(
        language.getText('configuration.askAccountId'),
        ZERO_ADDRESS,
      );
      while (!/\d\.\d\.\d/.test(accountId)) {
        console.log(language.getText('validations.wrongFormatAddress'));
        accountId = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAccountId'),
          ZERO_ADDRESS,
        );
      }

      const accountType = await this.askForAccountType();

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
      const accountConfig: IAccountConfig = {
        accountId: accountId,
        type: accountType,
        network: network,
        alias: alias,
      };

      switch (accountType) {
        case AccountType.SelfCustodial:
          accountConfig.selfCustodial = {
            privateKey: await this.askForPrivateKeyOfAccount(accountId),
          };
          break;
        case AccountType.Fireblocks:
          accountConfig.nonCustodial = {
            fireblocks: await this.askForFireblocksOfAccount(),
          };
          break;
        default:
          accountConfig.nonCustodial = {
            dfns: await this.askForDfnsOfAccount(),
          };
          break;
      }
      accounts.push(accountConfig);

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

  /**
   * Function to configure the default mirrors and rpcs
   */
  public async configureDefaultMirrorsAndRPCs(): Promise<void> {
    const mirrors: IMirrorsConfig[] = [];
    mirrors.push(setMirrorNodeService.getDefaultMirrorByNetwork('testnet'));
    mirrors.push(setMirrorNodeService.getDefaultMirrorByNetwork('previewnet'));
    mirrors.push(setMirrorNodeService.getDefaultMirrorByNetwork('mainnet'));
    const rpcs: IRPCsConfig[] = [];
    rpcs.push(setRPCService.getDefaultRPCByNetwork('testnet'));
    rpcs.push(setRPCService.getDefaultRPCByNetwork('previewnet'));
    rpcs.push(setRPCService.getDefaultRPCByNetwork('mainnet'));
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.mirrors = mirrors;
    defaultCfgData.rpcs = rpcs;
    configurationService.setConfiguration(defaultCfgData);
  }

  /**
   * Function to manage the account menu
   */
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

        account =
          optionsWithoutColors[
            options.indexOf(
              options.filter(
                (filteredAccount) =>
                  filteredAccount.split('-')[0].trim() ===
                  account.split('-')[0].trim(),
              )[0],
            )
          ];

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

  public async askForAccountType(): Promise<AccountType> {
    const accountType = await utilsService.defaultMultipleAsk(
      language.getText('configuration.askAccountType'),
      language.getArrayFromObject('wizard.accountType'),
      false,
    );
    switch (accountType) {
      case 'SELF-CUSTODIAL':
        return AccountType.SelfCustodial;
      case 'FIREBLOCKS':
        return AccountType.Fireblocks;
      case 'DFNS':
        return AccountType.Dfns;
      default:
        return await this.askForAccountType();
    }
  }

  /**
   * Function to configure the private key, fail if length doesn't 96 or 64 or 66
   */
  public async askForPrivateKeyOfAccount(
    accountId: string,
  ): Promise<IPrivateKey> {
    let privateKey: IPrivateKey = { key: '', type: '' };
    privateKey.key = await utilsService.defaultPasswordAsk(
      language.getText('configuration.askPrivateKey') +
        ` '96|64|66|68 characters' (${accountId})`,
    );

    privateKey.type = await utilsService.defaultMultipleAsk(
      language.getText('configuration.askPrivateKeyType'),
      language.getArrayFromObject('wizard.privateKeyType'),
    );

    // Actions by length
    switch (privateKey.key.length) {
      case 64:
        privateKey.key = '0x' + privateKey.key;
        break;
      case 96:
      default:
        break;
    }

    if (
      privateKey.key.length !== 96 &&
      privateKey.key.length !== 64 &&
      privateKey.key.length !== 66
    ) {
      utilsService.showError(language.getText('general.incorrectParam'));
      privateKey = await this.askForPrivateKeyOfAccount(accountId);
    }

    return privateKey;
  }

  private async askForApiKey(
    attribute: string,
    defaultValue: string,
  ): Promise<string> {
    let apiKey = '';
    const uuidRexExpValidator =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    while (!uuidRexExpValidator.test(apiKey)) {
      apiKey = await utilsService.defaultSingleAsk(
        language.getText(attribute),
        defaultValue,
      );
    }
    return apiKey;
  }

  private async askForUrl(
    attribute: string,
    defaultValue: string,
  ): Promise<string> {
    let baseUrl = '';
    const urlRegExpValidator =
      /^(http|https):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]$/g;
    while (!urlRegExpValidator.test(baseUrl)) {
      baseUrl = await utilsService.defaultSingleAsk(
        language.getText(attribute),
        defaultValue,
      );
    }
    return baseUrl;
  }

  private async askForHederaAccountPublicKey(
    attribute: string,
    defaultValue: string,
  ): Promise<string> {
    let hederaAccountPublicKey = '';
    const publicKeyRegExpValidator = /[0-9a-f]{64}/g;
    while (!publicKeyRegExpValidator.test(hederaAccountPublicKey)) {
      hederaAccountPublicKey = await utilsService.defaultSingleAsk(
        language.getText(attribute),
        defaultValue,
      );
    }
    return hederaAccountPublicKey;
  }

  public async askForFireblocksOfAccount(): Promise<IFireblocksAccountConfig> {
    utilsService.showMessage(
      language.getText('configuration.fireblocks.title'),
    );
    const apiSecretKeyPath = await this.askForFilePath(
      'configuration.fireblocks.askApiSecretKey',
      '/user/fireblocks/privateKey.key',
    );
    const apiKey = await this.askForApiKey(
      'configuration.fireblocks.askApiKey',
      'bbe6a358-0c98-460a-a2fc-91e035f74d54',
    );
    const baseUrl = await this.askForUrl(
      'configuration.fireblocks.askBaseUrl',
      'https://api.fireblocks.io',
    );
    const assetId = await utilsService.defaultSingleAsk(
      language.getText('configuration.fireblocks.askAssetId'),
      'HBAR_TEST',
    );
    const vaultAccountId = await utilsService.defaultSingleAsk(
      language.getText('configuration.fireblocks.askVaultAccountId'),
      '2',
    );
    const hederaAccountPublicKey = await this.askForHederaAccountPublicKey(
      'configuration.askAccountPubKey',
      '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
    );

    return {
      apiSecretKeyPath,
      apiKey,
      baseUrl,
      assetId,
      vaultAccountId,
      hederaAccountPublicKey,
    };
  }

  public async askForDfnsOfAccount(): Promise<IDfnsAccountConfig> {
    utilsService.showMessage(language.getText('configuration.dfns.title'));
    const authorizationToken = await utilsService.defaultPasswordAsk(
      language.getText('configuration.dfns.askAuthorizationToken'),
    );
    const credentialId = await this.askForDfnsCredentialId();
    const privateKeyPath = await this.askForFilePath(
      'configuration.dfns.askPrivateKeyPath',
      '/user/dfns/privateKey.key',
    );
    const appOrigin = await this.askForUrl(
      'configuration.dfns.askAppOrigin',
      'https://localhost:3000',
    );
    const appId = await this.askForDfnsAppId();
    const testUrl = await this.askForUrl(
      'configuration.dfns.askTestUrl',
      'https://api.dfns.ninja/',
    );
    const walletId = await this.askForDfnsWalletId();
    const hederaAccountPublicKey = await this.askForHederaAccountPublicKey(
      'configuration.askAccountPubKey',
      '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
    );

    return {
      authorizationToken,
      credentialId,
      privateKeyPath,
      appOrigin,
      appId,
      testUrl,
      walletId,
      hederaAccountPublicKey,
    };
  }

  private async askForDfnsCredentialId(): Promise<string> {
    let credentialId = '';
    const credentialIdRegExpValidator = /[a-zA-Z0-9]{42}$/g;
    while (!credentialIdRegExpValidator.test(credentialId)) {
      credentialId = await utilsService.defaultSingleAsk(
        language.getText('configuration.dfns.askCredentialId'),
        'Y2ktMTZ2NTMtZXF0ZzAtOWRvOXJub3NjbGI1a3RwYg',
      );
    }
    return credentialId;
  }

  private async askForFilePath(
    attribute: string,
    defaultValue: string,
  ): Promise<string> {
    let privateKeyPath = '';
    const pathRegExpValidator = /^(\/[^/ ]*)+\/?$/g;

    while (
      !(
        pathRegExpValidator.test(privateKeyPath) &&
        fs.existsSync(privateKeyPath)
      )
    ) {
      privateKeyPath = await utilsService.defaultSingleAsk(
        language.getText(attribute),
        defaultValue,
      );
    }

    return privateKeyPath;
  }

  private async askForDfnsAppId(): Promise<string> {
    let appId = '';
    const appIdRegExpValidator = /ap-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/g;
    while (!appIdRegExpValidator.test(appId)) {
      appId = await utilsService.defaultSingleAsk(
        language.getText('configuration.dfns.askAppId'),
        'ap-2ng9jv-80cfc-983pop0iauf2sv8r',
      );
    }
    return appId;
  }

  private async askForDfnsWalletId(): Promise<string> {
    let walletId = '';
    const walletIdRegExpValidator = /wa-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/g;
    while (!walletIdRegExpValidator.test(walletId)) {
      walletId = await utilsService.defaultSingleAsk(
        language.getText('configuration.dfns.askWalletId'),
        'wa-6qfr0-heg0c-985bmvv9hphbok47',
      );
    }
    return walletId;
  }

  /**
   * Function to configure network
   *
   * @param networkName network name
   *
   * @returns network configuration
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
