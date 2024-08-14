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

import fs from 'fs-extra';
import colors from 'colors';
import {
  configurationService,
  language,
  utilsService,
  wizardService,
  setMirrorNodeService,
  setRPCService,
  setFactoryService,
  backendConfigurationService,
} from '../../../index.js';
import Service from '../Service.js';
import { ZERO_ADDRESS } from '../../../core/Constants.js';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { IConsensusNodeConfig } from '../../../domain/configuration/interfaces/IConsensusNodeConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import { IMirrorsConfig } from '../../../domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from '../../../domain/configuration/interfaces/IRPCsConfig.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType';
import { IPrivateKey } from '../../../domain/configuration/interfaces/IPrivateKey';
import { IFireblocksAccountConfig } from '../../../domain/configuration/interfaces/IFireblocksAccountConfig';
import { IDfnsAccountConfig } from '../../../domain/configuration/interfaces/IDfnsAccountConfig';
import { IAWSKMSAccountConfig } from '../../../domain/configuration/interfaces/IAWSKMSAccountConfig';

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
    utilsService.showMessage(language.getText('configuration.initialTitle'));
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
    // Stablecoin Backend Configuration
    const configBackend = await utilsService.defaultConfirmAsk(
      language.getText('configuration.askConfigurateBackend'),
      true,
    );
    if (configBackend) {
      await backendConfigurationService.configureBackend();
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
   * Configures the default network for the application.
   * If a network is provided, it sets it as the default network.
   * If no network is provided, it prompts the user to select a network from the available options.
   * If the selected network is a default network, it prompts the user to select a different network or create a custom one.
   * Finally, it sets the selected network as the default network in the configuration and returns it.
   *
   * @param _network (optional) The network to set as the default. If not provided, the user will be prompted to select a network.
   * @returns A Promise that resolves to the selected network.
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
        (accounts[0].custodial &&
          (accounts[0].custodial.fireblocks || accounts[0].custodial.dfns)))
    ) {
      accounts = [];
    }
    let moreAccounts = true;

    while (moreAccounts) {
      utilsService.showMessage(
        language.getText('configuration.AccountsConfigurationMessage'),
      );
      let accountId: string;
      do {
        accountId = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAccountId'),
          ZERO_ADDRESS,
        );
        if (!/\d\.\d\.\d/.test(accountId)) {
          console.log(language.getText('validations.wrongFormatAddress'));
        }
      } while (!/\d\.\d\.\d/.test(accountId));

      //* Ask for Account Type
      const type = await this.askForAccountType();

      //* Ask for Network
      const network = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askNetworkAccount'),
        configuration.networks.map((acc) => acc.name),
      );

      //* Ask for Account Alias
      let alias: string;
      do {
        alias = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAlias'),
          'AdminAccount',
        );
        // Check if alias is already in use
        if (accounts.some((account) => account.alias === alias)) {
          utilsService.showError(
            language.getText('configuration.aliasAlreadyInUse', {
              alias,
            }),
          );
          alias = '';
        }
      } while (!alias);
      // Basic account configuration
      const accountConfig: IAccountConfig = {
        accountId,
        type,
        network,
        alias,
      };

      // Additional configuration based on account type
      if (type === AccountType.SelfCustodial) {
        accountConfig.selfCustodial = {
          privateKey: await this.askForPrivateKeyOfAccount(accountId),
        };
      } else if (type === AccountType.Fireblocks) {
        accountConfig.custodial = {
          fireblocks: await this.askForFireblocksOfAccount(),
        };
      } else if (type === AccountType.Dfns) {
        accountConfig.custodial = {
          dfns: await this.askForDfnsOfAccount(),
        };
      } else if (type === AccountType.AWSKMS) {
        accountConfig.custodial = {
          awsKms: await this.askForAWSKMSAccountConfig(),
        };
      }

      // Add accountConfig to the list
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

  /**
   * Asks the user for the account type and returns the selected account type.
   * @returns A Promise that resolves to the selected AccountType.
   */
  public async askForAccountType(): Promise<AccountType> {
    let accountType: string;
    do {
      accountType = await utilsService.defaultMultipleAsk(
        language.getText('configuration.askAccountType'),
        language.getArrayFromObject('wizard.accountType'),
        false,
      );
    } while (!Object.values(AccountType).includes(accountType as AccountType));

    return accountType as AccountType;
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

    privateKey.type = await this.askForPrivateKeyType(
      'configuration.askPrivateKeyType',
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

  private async askForPrivateKeyType(attribute: string): Promise<string> {
    return await utilsService.defaultMultipleAsk(
      language.getText(attribute),
      language.getArrayFromObject('wizard.privateKeyType'),
    );
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

  //TODO: review public key format
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
      '',
    );
    const baseUrl = await this.askForUrl(
      'configuration.fireblocks.askBaseUrl',
      'https://api.fireblocks.io',
    );
    const assetId = await utilsService.defaultSingleAsk(
      language.getText('configuration.fireblocks.askAssetId'),
      '',
    );
    const vaultAccountId = await utilsService.defaultSingleAsk(
      language.getText('configuration.fireblocks.askVaultAccountId'),
      '',
    );
    const hederaAccountPublicKey = await this.askForHederaAccountPublicKey(
      'configuration.askAccountPubKey',
      '',
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
      '',
    );
    const hederaAccountKeyType = await this.askForPrivateKeyType(
      'configuration.askPrivateKeyType',
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
      hederaAccountKeyType,
    };
  }

  private async askForDfnsCredentialId(): Promise<string> {
    let credentialId = '';
    const credentialIdRegExpValidator = /[a-zA-Z0-9]{42}$/g;
    while (!credentialIdRegExpValidator.test(credentialId)) {
      credentialId = await utilsService.defaultSingleAsk(
        language.getText('configuration.dfns.askCredentialId'),
        '',
      );
    }
    return credentialId;
  }

  private async askForFilePath(
    attribute: string,
    defaultValue: string,
  ): Promise<string> {
    let privateKeyPath: string;
    const pathRegExpValidator = /^(\/[^/ ]*)+\/?$/g;

    do {
      privateKeyPath = await utilsService.defaultSingleAsk(
        language.getText(attribute),
        defaultValue,
      );
    } while (
      !pathRegExpValidator.test(privateKeyPath) ||
      !fs.existsSync(privateKeyPath)
    );

    return privateKeyPath;
  }

  private async askForDfnsAppId(): Promise<string> {
    let appId = '';
    const appIdRegExpValidator = /ap-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+/g;
    while (!appIdRegExpValidator.test(appId)) {
      appId = await utilsService.defaultSingleAsk(
        language.getText('configuration.dfns.askAppId'),
        '',
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
        '',
      );
    }
    return walletId;
  }

  public async askForAWSKMSAccountConfig(): Promise<IAWSKMSAccountConfig> {
    utilsService.showMessage(language.getText('configuration.awsKms.title'));

    const awsAccessKeyId = await utilsService.defaultSingleAsk(
      language.getText('configuration.awsKms.askAccessKeyId'),
      '',
    );

    const awsSecretAccessKey = await utilsService.defaultPasswordAsk(
      language.getText('configuration.awsKms.askSecretAccessKey'),
    );

    const awsRegion = await utilsService.defaultSingleAsk(
      language.getText('configuration.awsKms.askRegion'),
      'eu-north-1',
    );

    const awsKmsKeyId = await utilsService.defaultSingleAsk(
      language.getText('configuration.awsKms.askKmsKeyId'),
      '',
    );

    const hederaAccountPublicKey = await this.askForHederaAccountPublicKey(
      'configuration.askAccountPubKey',
      '',
    );

    return {
      awsAccessKeyId,
      awsSecretAccessKey,
      awsRegion,
      awsKmsKeyId,
      hederaAccountPublicKey,
    };
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
