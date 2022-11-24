import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { CashOutStableCoinRequest, SDK } from 'hedera-stable-coin-sdk';

/**
 * Burn Stable Coin Service
 */
export default class BurnStableCoinsService extends Service {
  constructor() {
    super('Burn Stable Coin');
  }

  /**
   * Burn Stable Coin
   */
  public async burnStableCoin(req: CashOutStableCoinRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.cashOut(req), {
        text: language.getText('state.loading'),
        successText: language.getText('state.burnCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
