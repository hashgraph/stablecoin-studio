import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { CashInStableCoinRequest, SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class CashInStableCoinsService extends Service {
  constructor() {
    super('Cash In Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async cashInStableCoin(
    request: CashInStableCoinRequest,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();
    await utilsService.showSpinner(sdk.cashIn(request), {
        text: language.getText('state.loading'),
        successText: language.getText('state.cashInCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
