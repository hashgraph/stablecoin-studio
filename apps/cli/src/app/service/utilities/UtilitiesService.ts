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

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as inquirer from 'inquirer';
import figlet from 'figlet-promised';
import {
  configurationService,
  language,
  setMirrorNodeService,
  setRPCService,
} from '../../../index.js';
import Service from '../Service.js';
import Table from 'cli-table3';
import {
  AWSKMSConfigRequest,
  ConnectRequest,
  DFNSConfigRequest,
  FireblocksConfigRequest,
  InitializationRequest,
  Network,
  SDK,
  StableCoinListViewModel,
  SupportedWallets,
  ValidationResponse,
} from '@hashgraph/stablecoin-npm-sdk';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import colors from 'colors';
import MaskData from 'maskdata';
import { clear } from 'console';
import { IFactoryConfig } from '../../../domain/configuration/interfaces/IFactoryConfig.js';
import { IHederaTokenManagerConfig } from '../../../domain/configuration/interfaces/IHederaTokenManagerConfig.js';
import { IMirrorsConfig } from 'domain/configuration/interfaces/IMirrorsConfig.js';
import { IRPCsConfig } from 'domain/configuration/interfaces/IRPCsConfig.js';
import { MIRROR_NODE, RPC } from '../../../core/Constants.js';
import { AccountType } from '../../../domain/configuration/interfaces/AccountType.js';
import fs from 'fs';
import MultiSigTransaction from '../../../domain/stablecoin/MultiSigTransaction.js';
import BackendConfig from '../../../domain/configuration/interfaces/BackendConfig.js';

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
  private currentAccount: IAccountConfig;
  private currentNetwork: INetworkConfig;
  private currentMirror: IMirrorsConfig;
  private currentRPC: IRPCsConfig;
  private currentBackend: BackendConfig;
  private currentFactory: IFactoryConfig;
  private currentHederaTokenManager: IHederaTokenManagerConfig;

  constructor() {
    super('Utilities');
  }

  public async initSDK(): Promise<void> {
    const account = this.getCurrentAccount();
    SDK.log = configurationService.getLogConfiguration();
    const currentNetwork = this.getCurrentNetwork();
    const mirrorNode = this.getCurrentMirror();
    const currentBackend = this.getCurrentBackend();
    const rpcNode = this.getCurrentRPC();
    await Network.init(
      new InitializationRequest({
        network: currentNetwork.name,
        mirrorNode,
        rpcNode,
        consensusNodes: currentNetwork.consensusNodes,
        backend: currentBackend
          ? {
              url: currentBackend.endpoint,
            }
          : undefined,
      }),
    );
    //* Connect to the network
    let privateKey: { key: string; type: string };
    let wallet: SupportedWallets;
    let custodialWalletSettings:
      | FireblocksConfigRequest
      | DFNSConfigRequest
      | AWSKMSConfigRequest;
    switch (account.type) {
      case AccountType.SelfCustodial:
        privateKey = {
          key: account.selfCustodial.privateKey.key,
          type: account.selfCustodial.privateKey.type,
        };
        wallet = SupportedWallets.CLIENT;
        break;
      case AccountType.Fireblocks:
        wallet = SupportedWallets.FIREBLOCKS;
        custodialWalletSettings = {
          apiSecretKey: fs.readFileSync(
            account.custodial.fireblocks.apiSecretKeyPath,
            'utf8',
          ),
          apiKey: account.custodial.fireblocks.apiKey,
          baseUrl: account.custodial.fireblocks.baseUrl,
          vaultAccountId: account.custodial.fireblocks.vaultAccountId,
          assetId: account.custodial.fireblocks.assetId,
          hederaAccountId: account.accountId,
          hederaAccountPublicKey:
            account.custodial.fireblocks.hederaAccountPublicKey,
        } as FireblocksConfigRequest;
        break;
      case AccountType.Dfns:
        wallet = SupportedWallets.DFNS;
        if (!account.custodial || !account.custodial.dfns) {
          throw new Error('DFNS settings are required');
        }
        if (!account.custodial.dfns.privateKeyPath) {
          throw new Error('Private key path is required for DFNS');
        }
        if (!fs.existsSync(account.custodial.dfns.privateKeyPath)) {
          throw new Error('Private key file does not exist');
        }
        custodialWalletSettings = {
          authorizationToken: account.custodial.dfns.authorizationToken,
          credentialId: account.custodial.dfns.credentialId,
          serviceAccountPrivateKey: fs.readFileSync(
            account.custodial.dfns.privateKeyPath,
            'utf8',
          ),
          urlApplicationOrigin: account.custodial.dfns.appOrigin,
          applicationId: account.custodial.dfns.appId,
          baseUrl: account.custodial.dfns.testUrl,
          walletId: account.custodial.dfns.walletId,
          hederaAccountId: account.accountId,
          publicKey: account.custodial.dfns.hederaAccountPublicKey,
        } as DFNSConfigRequest;
        break;
      case AccountType.AWSKMS:
        wallet = SupportedWallets.AWSKMS;
        custodialWalletSettings = {
          awsAccessKeyId: account.custodial.awsKms.awsAccessKeyId,
          awsSecretAccessKey: account.custodial.awsKms.awsSecretAccessKey,
          awsRegion: account.custodial.awsKms.awsRegion,
          awsKmsKeyId: account.custodial.awsKms.awsKmsKeyId,
          hederaAccountId: account.accountId,
        } as AWSKMSConfigRequest;
        break;
      case AccountType.MultiSignature:
        wallet = SupportedWallets.MULTISIG;
        break;
      default:
        throw new Error('Invalid account type');
    }
    const connectRequest = {
      account: {
        accountId: account.accountId,
        privateKey: privateKey,
      },
      network: currentNetwork.name,
      mirrorNode,
      rpcNode: rpcNode,
      wallet: wallet,
      custodialWalletSettings: custodialWalletSettings,
    };
    await Network.connect(new ConnectRequest(connectRequest));
  }

  public setCurrentAccount(account: IAccountConfig): void {
    this.currentAccount = account;
  }

  public getCurrentAccount(): IAccountConfig {
    if (!this.currentAccount) {
      throw new Error('Account not initialized');
    } else {
      return this.currentAccount;
    }
  }

  public isAccountConfigValid(account: IAccountConfig): boolean {
    const validations = {
      [AccountType.SelfCustodial]: () => !!account.selfCustodial,
      [AccountType.Fireblocks]: () =>
        !!account.custodial && !!account.custodial.fireblocks,
      [AccountType.Dfns]: () => !!account.custodial && !!account.custodial.dfns,
      [AccountType.AWSKMS]: () =>
        !!account.custodial && !!account.custodial.awsKms,
    };

    return validations[account.type]();
  }

  public setCurrentNetwotk(network: INetworkConfig): void {
    this.currentNetwork = network;
  }

  public getCurrentNetwork(): INetworkConfig {
    if (!this.currentNetwork) {
      throw new Error('Network not initialized');
    } else {
      return this.currentNetwork;
    }
  }

  public setCurrentMirror(mirror: IMirrorsConfig): void {
    this.currentMirror = mirror;
  }

  public getCurrentMirror(): IMirrorsConfig {
    if (!this.currentMirror) {
      throw new Error('Mirror not initialized');
    } else {
      return this.currentMirror;
    }
  }

  public setCurrentRPC(rpc: IRPCsConfig): void {
    this.currentRPC = rpc;
  }

  public getCurrentRPC(): IRPCsConfig {
    if (!this.currentRPC) {
      throw new Error('JSON-RPC-Relay not initialized');
    } else {
      return this.currentRPC;
    }
  }

  public setCurrentBackend(backend: BackendConfig): void {
    this.currentBackend = backend;
  }

  public getCurrentBackend(): BackendConfig | undefined {
    if (!this.currentBackend) {
      // throw new Error('Backend not initialized');
      console.warn(
        colors.yellow('Backend not initialized'),
        'Current Backend: ',
        this.currentBackend,
      );
      return undefined;
    } else {
      return this.currentBackend;
    }
  }

  public setCurrentFactory(factory: IFactoryConfig): void {
    this.currentFactory = factory;
  }

  public setCurrentHederaTokenManager(
    hederaTokenManager: IHederaTokenManagerConfig,
  ): void {
    this.currentHederaTokenManager = hederaTokenManager;
  }

  public getCurrentFactory(): IFactoryConfig {
    if (!this.currentFactory) {
      throw new Error('Factory not initialized');
    } else {
      return this.currentFactory;
    }
  }

  public getCurrentHederaTokenManager(): IHederaTokenManagerConfig {
    if (!this.currentHederaTokenManager) {
      throw new Error('HederaTokenManager not initialized');
    } else {
      return this.currentHederaTokenManager;
    }
  }

  /**
   * Show application banner
   */
  public async showBanner(): Promise<void> {
    const data = await figlet(language.getText('general.title'));
    this.showMessage(data);
    this.breakLine(1);
  }

  /**
   * Show application warning banner
   */
  public async showCostWarningBanner(): Promise<void> {
    this.showWarning(language.getText('general.warning'));
    this.breakLine(1);
  }

  /**
   * Function through which all errors pass
   * @param error Error message
   */
  public showError(error: string): void {
    console.error(colors.red(error));
  }

  /**
   * Function through which all warnings pass
   * @param warn Warning message
   */
  public showWarning(warn: string): void {
    console.warn(colors.yellow(warn));
  }

  /**
   * Function through which all success messages pass
   * @param message Message
   */
  public showMessage(message: string): void {
    console.log(message);
  }

  /**
   * Delays the execution for the specified number of milliseconds.
   * @param ms - The number of milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  public delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Function to create n break line
   * @param n
   */
  public breakLine(n = 1): void {
    console.log('\n'.repeat(n));
  }

  /**
   * Function to show spinner component
   * @param promise
   * @param options
   */
  public async showSpinner<T>(
    promise: Promise<T>,
    options: object,
  ): Promise<void> {
    const { oraPromise } = await import('ora');

    await oraPromise(promise, options);
  }

  /**
   * Function for simple ask questions with inquire
   * @param question
   * @param defaultValue
   * @returns
   */
  public async defaultSingleAsk(
    question: string,
    defaultValue: string | undefined,
  ): Promise<string> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'input',
      message: question,
      default() {
        return defaultValue;
      },
    });
    return variable.response;
  }

  /**
   * Function for multiple ask questions with inquire
   * @param question
   * @param choices
   * @returns
   */
  public async defaultMultipleAsk(
    question: string,
    choices: Array<string>,
    goBack?: boolean,
    options?: {
      network?: string;
      account?: string;
      token?: string;
      tokenPaused?: boolean;
      tokenDeleted?: boolean;
      mirrorNode?: string;
      rpc?: string;
      backend?: string;
    },
  ): Promise<string> {
    const {
      network,
      mirrorNode,
      rpc,
      backend,
      account,
      token,
      tokenPaused,
      tokenDeleted,
    } = options || {};

    const networkInfo = network
      ? ` ${colors.underline(colors.bold('Network:'))} ${colors.cyan(
          `(${network}`,
        )}`
      : '';
    const mirrorInfo = mirrorNode
      ? colors.cyan(` - mirror: ${mirrorNode}`)
      : '';
    const rpcInfo = rpc ? colors.cyan(`, rpc: ${rpc}`) : '';
    const backendInfo = backend ? colors.cyan(`, backend: ${backend}`) : '';
    const closingBracket =
      networkInfo || mirrorInfo || rpcInfo ? colors.cyan(')') : '';

    const accountInfo = account
      ? ` ${colors.underline(colors.bold('Account:'))} ${colors.magenta(
          `(${account})`,
        )}`
      : '';
    const tokenInfo = token
      ? ` ${colors.underline(colors.bold('Stablecoin:'))} ${colors.yellow(
          `(${token})`,
        )}`
      : '';
    const tokenPausedInfo = tokenPaused ? ' | ' + colors.red('PAUSED') : '';
    const tokenDeletedInfo = tokenDeleted ? ' | ' + colors.red('DELETED') : '';

    const infoArray = [
      networkInfo,
      mirrorInfo,
      rpcInfo,
      backendInfo,
      closingBracket,
      accountInfo,
      tokenInfo,
      tokenPausedInfo,
      tokenDeletedInfo,
    ];

    question += infoArray.filter(Boolean).join('') + '\n';

    const variable = await inquirer.prompt({
      name: 'response',
      type: 'rawlist',
      message: question,
      choices: goBack
        ? [...choices, ...language.getArrayFromObject('wizard.backOption')]
        : choices,
    });
    return variable.response;
  }

  public async checkBoxMultipleAsk(
    question: string,
    choices: Array<string>,
    loop = false,
    atLeastOne = false,
  ): Promise<string[]> {
    let NOK;
    let variable;

    do {
      NOK = false;
      variable = await inquirer.prompt({
        name: 'response',
        type: 'checkbox',
        message: question,
        choices: choices,
        loop: loop,
      });

      if (atLeastOne && variable.response.length == 0) {
        NOK = true;
        this.showError('You must choose at least one option');
      }
    } while (NOK);

    return variable.response;
  }

  /**
   * Function for multiple ask questions with inquire
   * @param question
   * @param defaultValue
   * @returns
   */
  public async defaultConfirmAsk(
    question: string,
    defaultValue: boolean,
  ): Promise<boolean> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'confirm',
      message: question,
      default() {
        return defaultValue;
      },
    });
    return variable.response;
  }

  /**
   * Function for error confirmation
   * @param question
   * @returns
   */
  public async defaultErrorConfirm(question: string): Promise<boolean> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'input',
      message: question,
      prefix: '❌',
      transformer: () => {
        return '';
      },
      default: '[Enter]',
    });
    return variable.response;
  }

  public async confirmContinue(
    question = language.getText('general.continue'),
  ): Promise<boolean> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'confirm',
      message: question,
    });
    return variable.response;
  }

  /**
   * Function for simple ask questions with inquire
   * @param question
   * @param defaultValue
   * @returns
   */
  public async defaultPasswordAsk(question: string): Promise<string> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'password',
      mask: '*',
      message: question,
    });
    return variable.response;
  }

  /**
   * Function to configure the public key, fail if length doesn't 96 or 64 or 66
   */
  public async defaultPublicKeyAsk(): Promise<{ key: string }> {
    const MIN_PUBLIC_KEY_LENGTH = 64;
    const MAX_PUBLIC_KEY_LENGTH = 130;
    let publicKey: string = await this.defaultSingleAsk(
      language.getText('configuration.askPublicKey') +
        ` with a length of ${MIN_PUBLIC_KEY_LENGTH}-${MAX_PUBLIC_KEY_LENGTH} characters`,
      undefined,
    );

    if (publicKey.startsWith('0x')) {
      publicKey = publicKey.substring(2);
    }

    if (
      publicKey.length < MIN_PUBLIC_KEY_LENGTH ||
      publicKey.length > MAX_PUBLIC_KEY_LENGTH
    ) {
      this.showError(language.getText('general.incorrectParam'));
      return await this.defaultPublicKeyAsk();
    }

    return { key: publicKey };
  }

  public async drawTableListStableCoin(
    data?: StableCoinListViewModel,
  ): Promise<void> {
    if (data.coins.length === 0) {
      console.log('There are no stablecoins available at this time.');
    } else {
      const table = new Table({
        style: { head: ['green'] },
        head: ['Id', 'Symbol'],
        colWidths: [15, 20],
      });

      if (data.coins) {
        data.coins.forEach((item) => table.push([item.id, item.symbol]));
      } else {
        table.push(['-', '-']);
      }

      console.log(table.toString());
    }
  }

  /**
   * Draws a table to display pending multisig transactions.
   * If there are no pending transactions, a message is logged.
   *
   * @param {Object} options - The options for drawing the table.
   * @param {MultiSigTransaction[]} options.multiSigTxList - The list of pending multisig transactions.
   * @returns {Promise<void>} - A promise that resolves when the table is drawn.
   */
  public async drawTableListPendingMultiSig({
    multiSigTxList,
  }: {
    multiSigTxList: MultiSigTransaction[];
  }): Promise<void> {
    if (multiSigTxList.length === 0) {
      console.log(
        '🙌 There are no pending multisig transactions at this time!',
      );
      return;
    }

    console.log('📜 There are pending multisig transactions for: ');
    // Define table for pending multisig transactions
    const table = new Table({
      style: { head: ['cyan', 'bold'] },
      head: ['Transaction ID', 'Description', 'Start Date', 'Status'],
      colWidths: [40, 60, 30, 12],
      wordWrap: true,
      wrapOnWordBoundary: true,
    });

    // Add pending multisig transactions to table
    multiSigTxList.forEach((multiSigTx) => {
      const startDateLocalTimeZone =
        new Date(multiSigTx.startDate).toDateString() +
        ' ' +
        new Date(multiSigTx.startDate).toLocaleTimeString();
      table.push([
        multiSigTx.id,
        multiSigTx.description,
        startDateLocalTimeZone,
        multiSigTx.status,
      ]);
    });

    // Show table
    console.info(table.toString());
  }

  public exitApplication(cause?: string): void {
    let code = 0; // OK
    if (cause) {
      this.showError(`\n 🛑 ${cause}`);
      code = 1;
    }
    process.exit(code);
  }

  public async askErrorConfirmation(
    cll?: (cause?: any) => unknown,
    cause?: any,
  ): Promise<void> {
    await this.cleanAndShowBanner();
    if (cause) {
      if (cause.transactionUrl) {
        this.showError(
          `You can see the transaction here: ${cause.transactionUrl}\n`,
        );
      }
      this.showError(`${cause}\n`);
    }
    await this.defaultErrorConfirm(language.getText('general.error'));
    this.showMessage('\n\n');
    cll && (await cll(cause));
  }

  public maskPrivateAccounts(accounts: IAccountConfig[]): IAccountConfig[] {
    const maskJSONOptions = {
      maskWith: '.',
      unmaskedStartCharacters: 4,
      unmaskedEndCharacters: 4,
    };
    const result = accounts.map((acc) => {
      return {
        accountId: acc.accountId,
        type: acc.type,
        network: acc.network,
        alias: acc.alias,
        importedTokens: acc.importedTokens,
        selfCustodial: !acc.selfCustodial
          ? undefined
          : {
              privateKey: {
                key: MaskData.maskPassword(
                  acc.selfCustodial.privateKey.key,
                  maskJSONOptions,
                ),
                type: acc.selfCustodial.privateKey.type,
              },
            },
        custodial: !acc.custodial
          ? undefined
          : {
              fireblocks: !acc.custodial.fireblocks
                ? undefined
                : {
                    apiSecretKeyPath: acc.custodial.fireblocks.apiSecretKeyPath,
                    apiKey: acc.custodial.fireblocks.apiKey,
                    baseUrl: acc.custodial.fireblocks.baseUrl,
                    assetId: acc.custodial.fireblocks.assetId,
                    vaultAccountId: acc.custodial.fireblocks.vaultAccountId,
                    hederaAccountPublicKey:
                      acc.custodial.fireblocks.hederaAccountPublicKey,
                  },
              dfns: !acc.custodial.dfns
                ? undefined
                : {
                    authorizationToken: acc.custodial.dfns.authorizationToken,
                    credentialId: acc.custodial.dfns.credentialId,
                    privateKeyPath: acc.custodial.dfns.privateKeyPath,
                    appOrigin: acc.custodial.dfns.appOrigin,
                    appId: acc.custodial.dfns.appId,
                    testUrl: acc.custodial.dfns.testUrl,
                    walletId: acc.custodial.dfns.walletId,
                    hederaAccountPublicKey:
                      acc.custodial.dfns.hederaAccountPublicKey,
                    hederaAccountKeyType:
                      acc.custodial.dfns.hederaAccountKeyType,
                  },
              awsKms: !acc.custodial.awsKms
                ? undefined
                : {
                    awsAccessKeyId: acc.custodial.awsKms.awsAccessKeyId,
                    awsSecretAccessKey: acc.custodial.awsKms.awsSecretAccessKey,
                    awsRegion: acc.custodial.awsKms.awsRegion,
                    awsKmsKeyId: acc.custodial.awsKms.awsKmsKeyId,
                    hederaAccountPublicKey:
                      acc.custodial.awsKms.hederaAccountPublicKey,
                  },
            },
      };
    });
    return result;
  }

  public maskMirrorNodes(mirrors: IMirrorsConfig[]): IMirrorsConfig[] {
    const maskJSONOptions = {
      maskWith: '.',
      unmaskedStartCharacters: 4,
      unmaskedEndCharacters: 4,
    };
    const result = mirrors.map((mirror) => {
      if (!mirror.apiKey) {
        delete mirror.apiKey;
        delete mirror.headerName;
        return mirror;
      }
      return {
        ...mirror,
        apiKey: MaskData.maskPassword(mirror.apiKey, maskJSONOptions),
      };
    });
    return result;
  }

  public maskRPCs(rpcs: IRPCsConfig[]): IMirrorsConfig[] {
    const maskJSONOptions = {
      maskWith: '.',
      unmaskedStartCharacters: 4,
      unmaskedEndCharacters: 4,
    };
    const result = rpcs.map((rpc) => {
      if (!rpc.apiKey) {
        delete rpc.apiKey;
        delete rpc.headerName;
        return rpc;
      }
      return {
        ...rpc,
        apiKey: MaskData.maskPassword(rpc.apiKey, maskJSONOptions),
      };
    });
    return result;
  }

  public async cleanAndShowBanner(): Promise<void> {
    clear();
    await this.showBanner();
  }

  public displayCurrentUserInfo(
    userInfo: IAccountConfig,
    token?: string,
  ): void {
    const { network, accountId, alias } = userInfo;

    let result = '';
    let networkInfo = '';
    let mirrorInfo = '';
    let rpcInfo = '';
    let backendInfo = '';

    if (network)
      networkInfo =
        ' ' +
        colors.underline(colors.bold('Network:')) +
        ' ' +
        colors.cyan('(' + network);
    if (this.currentMirror)
      mirrorInfo = colors.cyan(' - mirror: ' + this.currentMirror.name);
    if (this.currentRPC)
      rpcInfo = colors.cyan(', rpc: ' + this.currentRPC.name);
    if (this.currentBackend)
      backendInfo = colors.cyan(', backend: ' + this.currentBackend.endpoint);

    if (networkInfo || mirrorInfo || rpcInfo || backendInfo) {
      result =
        result +
        networkInfo +
        mirrorInfo +
        rpcInfo +
        backendInfo +
        colors.cyan(')');
    }

    if (accountId) {
      result = result + ' ' + colors.magenta(`(${accountId} - ${alias})`);
    }

    if (token) {
      result = result + ' ' + colors.yellow(`(${token})`);
    }

    this.showMessage(result);
  }

  public validateTokenId(str: string): boolean {
    return /\d\.\d\.\d/.test(str);
  }

  /**
   * Handles validation logic and prompts for user input until validation passes.
   * @param validate - A function that performs the validation and returns an array of ValidationResponse objects.
   * @param callback - A function that handles the validation response.
   * @param consoleOutput - A boolean indicating whether to output validation errors to the console.
   * @param checkBefore - A boolean indicating whether to perform the validation check before prompting for user input.
   */
  public async handleValidation(
    validate: () => ValidationResponse[],
    callback: (response: ValidationResponse[]) => Promise<void>,
    consoleOutput = true,
    checkBefore = false,
  ): Promise<void> {
    const outputErrors = (response: ValidationResponse[]): void => {
      for (const validation of response) {
        for (const error of validation.errors) {
          this.showError(`\t${error.message}`);
        }
      }
    };

    let response: ValidationResponse[];
    let askForInput = true;

    if (checkBefore) {
      response = validate();
      if (response.length === 0) {
        askForInput = false;
      }
    }

    while (askForInput) {
      askForInput = false;
      await callback(response ?? []);
      response = validate();
      if (consoleOutput) {
        outputErrors(response);
      }
      if (response.length > 0) {
        askForInput = true;
      }
    }
  }

  /**
   * Function to configure the network for mirror node or rpc
   *
   * @param networkType type of network to configure
   */
  public async configureNetwork(networkType: string): Promise<void> {
    const currentAccount = this.getCurrentAccount();
    const currentMirror = this.getCurrentMirror();
    const currentRPC = this.getCurrentRPC();
    const currentBackend = this.getCurrentBackend();
    const networks = configurationService
      .getConfiguration()
      .networks.map((network) => network.name);
    const network = await this.defaultMultipleAsk(
      language.getText('wizard.networkManage'),
      networks,
      false,
      {
        network: currentAccount.network,
        mirrorNode: currentMirror.name,
        rpc: currentRPC.name,
        backend: currentBackend?.endpoint,
        account: `${currentAccount.accountId} - ${currentAccount.alias}`,
      },
    );

    this.showMessage(language.getText('wizard.networkSelected', { network }));

    switch (networkType) {
      case MIRROR_NODE:
        await setMirrorNodeService.manageMirrorNodeMenu(network);
        break;
      case RPC:
        await setRPCService.manageRPCMenu(network);
        break;
      default:
        this.showError(
          `Not valid network type for configuration: ${networkType}\n`,
        );
        break;
    }
  }

  public formatDateTime(dateTime: Date): string {
    let month = (dateTime.getUTCMonth() + 1).toString();
    if (month.length < 2) month = '0' + month;

    let day = dateTime.getUTCDate().toString();
    if (day.length < 2) day = '0' + day;

    let hour = dateTime.getUTCHours().toString();
    if (hour.length < 2) hour = '0' + hour;

    let minute = dateTime.getUTCMinutes().toString();
    if (minute.length < 2) minute = '0' + minute;

    let second = dateTime.getUTCSeconds().toString();
    if (second.length < 2) second = '0' + second;

    return (
      dateTime.getUTCFullYear().toString() +
      '-' +
      month +
      '-' +
      day +
      'T' +
      hour +
      ':' +
      minute +
      ':' +
      second +
      'Z'
    );
  }
}
