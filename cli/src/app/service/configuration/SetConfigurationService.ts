import {
  configurationService,
  language,
  utilsService,
} from '../../../index.js';
import Service from '../Service.js';
import fs from 'fs-extra';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { IConsensusNodeConfig } from '../../../domain/configuration/interfaces/IConsensusNodeConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';

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
  public async initConfiguration(path?: string): Promise<void> {
    utilsService.showMessage(language.getText('initialConfiguration.title'));
    await this.configurePath(path);
    await this.configureDefaultNetwork();
    await this.configureAccounts();
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
    if (!fs.existsSync(defaultPath)) {
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
  public async configureDefaultNetwork(): Promise<string> {
    let network = await utilsService.defaultSingleAsk(
      language.getText('configuration.askNetwork'),
      'mainnet|previewnet|testnet|local',
    );

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
    const accounts: IAccountConfig[] = [];
    let moreAccounts = true;

    while (moreAccounts) {
      utilsService.showMessage(`Account:`);

      const accountId = await utilsService.defaultSingleAsk(
        language.getText('configuration.askAccountId'),
        '0.0.0',
      );
      const accountFromPrivKey: IAccountConfig =
        await this.askForPrivateKeyOfAccount(accountId);
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
        network: configurationService.getConfiguration().defaultNetwork,
        alias: alias,
      });

      moreAccounts = false;
      /* const response = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMoreAccounts'),
        'y',
      );
      if (response !== 'y' && response !== 'yes') {
        moreAccounts = false;
      } */
    }

    // Set accounts
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.accounts = accounts;
    configurationService.setConfiguration(defaultCfgData);
    return accounts;
  }

  /**
   * Function to configure the private key, fail if length doesn't 96 or 64 or 66
   */
  public async askForPrivateKeyOfAccount(
    accountId: string,
  ): Promise<IAccountConfig> {
    let privateKey = await utilsService.defaultSingleAsk(
      language.getText('configuration.askPrivateKey') + ` (${accountId})`,
      '96|64|66 characters',
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
      privateKey = acc.privateKey;
      alias = acc.alias;
    }

    return {
      accountId: accountId,
      privateKey: privateKey,
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
