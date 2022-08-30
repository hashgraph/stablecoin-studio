import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  StableCoinDetail,
  StableCoinList,
} from '../../../domain/stablecoin/StableCoinList.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class ListStableCoinsService extends Service {
  private stableCoinId;

  constructor() {
    super('List Stable Coins');
  }

  /**
   * List Stable Coins can be managed
   */
  public async listStableCoins(): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = new SDK();

    let resp: StableCoinList[];

    await utilsService.showSpinnerList(
      sdk
        .getListStableCoin({
          privateKey:
            configurationService.getConfiguration().accounts[0].privateKey,
        })
        .then((response: StableCoinList[]) => (resp = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    utilsService.drawTableListStableCoin(resp);
    utilsService.breakLine();

    while (this.stableCoinId !== 'Exit to main menu') {
      this.stableCoinId = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askStableCoinDetail'),
        resp
          .map((item) => {
            return `${item.id} - ${item.symbol}`;
          })
          .concat('Exit to main menu'),
      );

      if (this.stableCoinId !== 'Exit to main menu') {
        let respDetail: StableCoinDetail;

        utilsService.breakLine();

        await utilsService.showSpinnerDetail(
          sdk
            .getStableCoin({
              stableCoinId: this.stableCoinId.split(' - ')[0],
            })
            .then((response: StableCoinDetail) => (respDetail = response)),
          {
            text: language.getText('state.searching'),
            successText: language.getText('state.searchingSuccess') + '\n',
          },
        );

        utilsService.breakLine();

        console.log(respDetail);
      }
    }
  }
}
