import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

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
    treasuryId: string,
    privateKey: string,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = new SDK();

    utilsService.breakLine();

    let respDetail: void;

    await utilsService.showSpinner(
      sdk
        .cashIn({ treasuryId, privateKey, accountId, amount })
        .then((response: void) => (respDetail = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    console.log(respDetail);
    utilsService.breakLine();
  }
}
