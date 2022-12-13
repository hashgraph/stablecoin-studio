import * as inquirer from 'inquirer';
import figlet from 'figlet-promised';
import Service from '../Service.js';
import { configurationService, language } from '../../../index.js';
import Table from 'cli-table3';
import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  ValidationResponse,
  Network,
  ConnectRequest,
  SupportedWallets,
  StableCoinListViewModel,
} from 'hedera-stable-coin-sdk';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
import colors from 'colors';
import MaskData from 'maskdata';
import { clear } from 'console';
import { IFactoryConfig } from '../../../domain/configuration/interfaces/IFactoryConfig.js';
import { IHederaERC20Config } from '../../../domain/configuration/interfaces/IHederaERC20Config.js';

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
  private currentAccount: IAccountConfig;
  private currentNetwork: INetworkConfig;
  private currentFactory: IFactoryConfig;
  private currentHederaERC20: IHederaERC20Config;

  constructor() {
    super('Utilities');
  }

  public async initSDK(): Promise<void> {
    const account = this.getCurrentAccount();
    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: account.accountId,
          privateKey: {
            key: account.privateKey.key,
            type: account.privateKey.type,
          },
        },
        network: this.getCurrentNetwork().name,
        wallet: SupportedWallets.CLIENT,
      }),
    );
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

  public setCurrentFactory(factory: IFactoryConfig): void {
    this.currentFactory = factory;
  }

  public setCurrentHederaERC20(hederaERC20: IHederaERC20Config): void {
    this.currentHederaERC20 = hederaERC20;
  }

  public getCurrentFactory(): IFactoryConfig {
    if (!this.currentFactory) {
      throw new Error('Factory not initialized');
    } else {
      return this.currentFactory;
    }
  }

  public getCurrentHederaERC20(): IHederaERC20Config {
    if (!this.currentHederaERC20) {
      throw new Error('HederaERC20 not initialized');
    } else {
      return this.currentHederaERC20;
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
    network?: string,
    account?: string,
    token?: string,
    tokenPaused?: boolean,
    tokenDeleted?: boolean,
  ): Promise<string> {
    if (network) {
      question =
        question +
        ' ' +
        colors.underline(colors.bold('Network:')) +
        ' ' +
        colors.cyan('(' + network + ')');
    }
    if (account) {
      question =
        question +
        ' ' +
        colors.underline(colors.bold('Account:')) +
        ' ' +
        colors.magenta('(' + account + ')');
    }
    if (token) {
      question =
        question +
        ' ' +
        colors.underline(colors.bold('Stablecoin:')) +
        ' ' +
        colors.yellow('(' + token + ')');
    }
    if (tokenPaused) {
      question = question + ' | ' + colors.red('PAUSED');
    }
    if (tokenDeleted) {
      question = question + ' | ' + colors.red('DELETED');
    }
    question = question + '\n';
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'rawlist',
      message: question,
      choices: goBack
        ? choices.concat(language.getArray('wizard.backOption'))
        : choices,
    });
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
  public async defaultPublicKeyAsk(): Promise<string> {
    let publicKey: string = await this.defaultSingleAsk(
      language.getText('configuration.askPublicKey') + ` '96|64|66 characters'`,
      undefined,
    );

    if (publicKey.length == 64) {
      publicKey = `0x${publicKey}`;
    }

    if (![64, 66, 96].includes(publicKey.length)) {
      this.showError(language.getText('general.incorrectParam'));
      publicKey = await this.defaultPublicKeyAsk();
    }

    return publicKey;
  }

  public async drawTableListStableCoin(
    data?: StableCoinListViewModel[],
  ): Promise<void> {
    if (data.length === 0) {
      console.log('There are no stable coins available at this time.');
    } else {
      const table = new Table({
        style: { head: ['green'] },
        head: ['Id', 'Symbol'],
        colWidths: [15, 20],
      });

      if (data) {
        data.forEach((item) => table.push([item.id, item.symbol]));
      } else {
        table.push(['-', '-']);
      }

      console.log(table.toString());
    }
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
    cll?: (cause?: string) => unknown,
    cause?: string,
  ): Promise<void> {
    await this.cleanAndShowBanner();
    if (cause) {
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
        privateKey: {
          key: MaskData.maskPassword(acc.privateKey.key, maskJSONOptions),
          type: acc.privateKey.type,
        },
        accountId: acc.accountId,
        network: acc.network,
        alias: acc.alias,
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
    if (network) {
      result = result + ' ' + colors.cyan(`( ${network} )`);
    }

    if (accountId) {
      result = result + ' ' + colors.magenta(`(${accountId} - ${alias})`);
    }

    if (token) {
      result = result + ' ' + colors.yellow(`( ${token} )`);
    }

    this.showMessage(result);
  }

  public validateTokenId(str: string): boolean {
    return /\d\.\d\.\d/.test(str);
  }

  public async handleValidation(
    val: () => ValidationResponse[],
    cll?: (res: ValidationResponse[]) => Promise<void>,
    consoleOut = true,
  ): Promise<void> {
    const outputError = (res: ValidationResponse[]): void => {
      for (let i = 0; i < res.length; i++) {
        const validation = res[i];
        // this.showError(`Validation failed for ${validation.name}:`);
        for (let j = 0; j < validation.errors.length; j++) {
          const error = validation.errors[j];
          this.showError(`\t${error.message}`);
        }
      }
    };

    let res = val();
    if (cll) {
      while (res.length > 0) {
        consoleOut && outputError(res);
        await cll(res);
        res = val();
      }
    } else {
      if (res.length > 0) consoleOut && outputError(res);
    }
  }
}
