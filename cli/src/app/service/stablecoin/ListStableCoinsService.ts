import { language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class ListStableCoinsService extends Service {
  constructor() {
    super('List Stable Coins');
  }

  /**
   * List Stable Coins can be managed
   */
  public async listStableCoins(): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();

    let resp: StableCoinList[];

    await utilsService.showSpinner(
      sdk
        .getListStableCoin({
          privateKey: currentAccount.privateKey,
        })
        .then((response: StableCoinList[]) => (resp = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    utilsService.drawTableListStableCoin(resp);
  }
}
