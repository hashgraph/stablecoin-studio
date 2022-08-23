import { configurationService, language, utilsService } from '../../../index.js';
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
  public async initConfiguration(): Promise<void> {
    utilsService.showMessage(language.getText('initialConfiguration.title'));
    await this.configurePath();
    await this.configureDefaultNetwork();
    await this.configureAccounts();
  }

  /**
   * Function to configure the default path, fails if the path doesn't exist
   */
  public async configurePath(): Promise<string> {
    const defaultConfigPath =
      configurationService.getConfiguration()?.general?.configPath;
    const defaultPath = await utilsService.defaultSingleAsk(
      language.getText('configuration.askPath'),
      defaultConfigPath ?? configurationService.getDefaultConfigurationPath(),
    );

    // If the path is incorrect
    if (!fs.existsSync(defaultPath)) {
      utilsService.showError(language.getText('general.incorrectParam'));
      await this.configurePath();
    }

    // Set default path
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.general.configPath = defaultPath;
    configurationService.setConfiguration(defaultCfgData, defaultPath);
    return defaultPath;
  }

  /**
   * Function to configure the default network
   */
  public async configureDefaultNetwork(): Promise<string> {
    let network = await utilsService.defaultSingleAsk(
      language.getText('configuration.askNetwork'),
      'mainnet|previewnet|testnet',
    );

    if (
      network === undefined ||
      network === '' ||
      network === 'mainnet|previewnet|testnet'
    ) {
      utilsService.showError(language.getText('general.incorrectParam'));
      network = await this.configureDefaultNetwork();
    }

    // If not mainnet or previewnet or testnet, try to create a new one
    if (
      network !== 'mainnet' &&
      network !== 'previewnet' &&
      network !== 'testnet'
    ) {
      const response = await utilsService.defaultSingleAsk(
        language.getText('configuration.askNotDefaultNetwork'),
        'y',
      );

      if (response === 'y' || response === 'yes') {
        await this.configureCustomNetwork(network);
      }
    }

    // Set a default network
    const defaultCfgData = configurationService.getConfiguration();
    defaultCfgData.general.network = network;
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
      utilsService.showMessage(`Account ${accounts.length + 1}`);

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
      while(accounts.some(account => account.alias === alias)){
        utilsService.showError(`Alias ${alias} already in use. Please use another alias.`);
        alias = await utilsService.defaultSingleAsk(
          language.getText('configuration.askAlias'),
          'AdminAccount',
        );
      }
      accounts.push({
        accountId: accountId,
        privateKey: accountFromPrivKey.privateKey,
        isECDA25519Type: accountFromPrivKey.isECDA25519Type,
        alias: alias
      });

      const response = await utilsService.defaultSingleAsk(
        language.getText('configuration.askMoreAccounts'),
        'y',
      );
      if (response !== 'y' && response !== 'yes') {
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
   * Function to configure the private key, fail if length doesn't 96 or 64 or 66
   */
  public async askForPrivateKeyOfAccount(
    accountId: string,
  ): Promise<IAccountConfig> {
    let privateKey = await utilsService.defaultSingleAsk(
      language.getText('configuration.askPrivateKey') + ` (${accountId})`,
      '96|64|66 characters',
    );

    let isECDA25519Type = false;
    let alias= '';

    // Actions by length
    switch (privateKey.length) {
      case 96:
        isECDA25519Type = true;
        break;
      case 64:
        privateKey = '0x' + privateKey;
        break;
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
      isECDA25519Type = acc.isECDA25519Type;
      alias = acc.alias;
    }

    return {
      accountId: accountId,
      privateKey: privateKey,
      isECDA25519Type: isECDA25519Type,
      alias: alias
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
      consensusNodes: consensusNodes,
      mirrorNodeUrl: mirrorUrl,
      chainId: Number(chainId),
    };
    defaultCfgData.networks.push(network);

    configurationService.setConfiguration(defaultCfgData);
    utilsService.showMessage('\n');
    return network;
  }
}
