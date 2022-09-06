import * as inquirer from 'inquirer';
import figlet from 'figlet-promised';
import Service from '../Service.js';
import { language } from '../../../index.js';
import Table from 'cli-table3';
import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  HederaNetwork,
  NetworkMode,
  SDK,
} from 'hedera-stable-coin-sdk';

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
  private sdk: SDK;

  constructor() {
    super('Utilities');
  }

  public async initSDK(): Promise<SDK> {
    this.sdk = await new SDK({
      network: HederaNetwork.TEST,
      mode: NetworkMode.EOA
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
  ): Promise<string> {
    const variable = await inquirer.prompt({
      name: 'response',
      type: 'rawlist',
      message: question,
      choices: choices,
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

  public async drawTableListStableCoin(data?: StableCoinList[]): Promise<void> {
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
