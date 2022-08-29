import { language, utilsService, wizardService } from '../../../index.js';
import Service from '../Service.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;

  constructor() {
    super('Operation Stable Coin');
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    await utilsService.showSpinner(
      new Promise((promise) => setTimeout(promise, 3000)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    this.stableCoinId = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askOperateStableCoinSelect'),
      ['Symbol 1', 'Symbol 2', 'Symbol 3', 'Cancel'],
    );

    if (this.stableCoinId === 'Cancel') await wizardService.mainMenu();

    await this.operationsStableCoin();
  }

  private async operationsStableCoin(): Promise<void> {
    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething') +
          ` (${this.stableCoinId})`,
        wizardOperationsStableCoinOptions,
      )
    ) {
      case wizardOperationsStableCoinOptions[0]:
        // Call to mint
        break;
      case wizardOperationsStableCoinOptions[1]:
        // Call to burn
        break;
      case wizardOperationsStableCoinOptions[2]:
        // Call to transfer
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await wizardService.mainMenu();
    }

    await this.operationsStableCoin();
  }
}
