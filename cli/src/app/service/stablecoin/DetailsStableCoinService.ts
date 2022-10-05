import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { IStableCoinDetail, SDK } from 'hedera-stable-coin-sdk';

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
  ): Promise<IStableCoinDetail> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let respDetail: IStableCoinDetail;

    await utilsService.showSpinner(
      sdk
        .getStableCoinDetails({
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
