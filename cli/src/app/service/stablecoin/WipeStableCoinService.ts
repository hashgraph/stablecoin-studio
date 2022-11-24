import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { WipeStableCoinRequest, SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class WipeStableCoinsService extends Service {
  constructor() {
    super('Wipe Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */

   public async wipeStableCoin(
    request: WipeStableCoinRequest,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.wipe(request), {
        text: language.getText('state.loading'),
        successText: language.getText('state.wipeCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}

