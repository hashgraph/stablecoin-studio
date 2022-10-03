import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK, StableCoin } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class DetailsStableCoinsService extends Service {
  constructor() {
    super('Details Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async getDetailsStableCoins(
    id: string,
    show = true,
  ): Promise<StableCoin> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let respDetail: StableCoin;

    await utilsService.showSpinner(
      sdk
        .getStableCoin({
          id,
        })
        .then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.detailsCompleted') + '\n',
      },
    );

    if (show) {
      console.log(respDetail);
      utilsService.breakLine();
    }
    return respDetail;
  }
}
