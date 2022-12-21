import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GetStableCoinDetailsRequest,
  StableCoin,
  StableCoinViewModel,
} from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class DetailsStableCoinsService extends Service {
  constructor() {
    super('Details Stable Coin');
  }

  public async getDetailsStableCoins(
    id: string,
    show = true,
  ): Promise<StableCoinViewModel> {
    // Call to list stable coins

    let respDetail: StableCoinViewModel;

    await utilsService.showSpinner(
      StableCoin.getInfo(
        new GetStableCoinDetailsRequest({
          id,
        }),
      ).then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.detailsCompleted') + '\n',
      },
    );

    if (show) {
      const out = {
        ...respDetail,
        initialSupply: respDetail.initialSupply.toString(),
        maxSupply: respDetail.maxSupply.toString(),
        totalSupply: respDetail.totalSupply.toString(),
      };
      console.log(out);
      utilsService.breakLine();
    }
    return respDetail;
  }
}
