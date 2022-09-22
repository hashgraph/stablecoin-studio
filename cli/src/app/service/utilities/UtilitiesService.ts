import * as inquirer from 'inquirer';
import figlet from 'figlet-promised';
import Service from '../Service.js';
import { language } from '../../../index.js';
import Table from 'cli-table3';
import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  HederaNetwork,
  HederaNetworkEnviroment,
  NetworkMode,
  SDK,
} from 'hedera-stable-coin-sdk';
import { IAccountConfig } from '../../../domain/configuration/interfaces/IAccountConfig.js';
import { INetworkConfig } from '../../../domain/configuration/interfaces/INetworkConfig.js';
const colors = require('colors');
const MaskData = require('maskdata');

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
  private sdk: SDK;
  private currentAccount: IAccountConfig;
  private currentNetwork: INetworkConfig;

  constructor() {
    super('Utilities');
  }

  public async initSDK(network: string): Promise<SDK> {
    const networks = {
      testnet: HederaNetworkEnviroment.TEST,
      previewnet: HederaNetworkEnviroment.PREVIEW,
      mainnet: HederaNetworkEnviroment.MAIN,
      local: HederaNetworkEnviroment.LOCAL,
    };
    this.sdk = await new SDK({
      network: new HederaNetwork(networks[network]),
      mode: NetworkMode.EOA,
    }).init();
    return this.sdk;
  }

  public getSDK(): SDK {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    } else {
      return this.sdk;
    }
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

  /**
   * Show application banner
   */
  public async showBanner(): Promise<void> {
    const data = await figlet(language.getText('general.title'));
    this.showMessage(data);
  }

  /**
   * Function through which all errors pass
   * @param error Error message
   */
  public showError(error: string): void {
    console.error(error);
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
  ): Promise<string> {
    if (network) {
      question = question + ' ' + colors.cyan('(' + network + ')');
    }
    if (account) {
      question = question + ' ' + colors.magenta('(' + account + ')');
    }
    if (token) {
      question = question + ' ' + colors.yellow('(' + token + ')');
    }
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'rawlist',
      message: question,
      choices: goBack
        ? choices.concat(language.getText('wizard.backOption'))
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

  public async drawTableListStableCoin(data?: StableCoinList[]): Promise<void> {
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

  public maskPrivateAccounts(accounts: IAccountConfig[]): IAccountConfig[] {
    const maskJSONOptions = {
      maskWith: '.',
      unmaskedStartCharacters: 4,
      unmaskedEndCharacters: 4,
    };
    const result = accounts.map((acc) => {
      return {
        privateKey: MaskData.maskPassword(acc.privateKey, maskJSONOptions),
        accountId: acc.accountId,
        network: acc.network,
        alias: acc.alias,
      };
    });
    return result;
  }
}
