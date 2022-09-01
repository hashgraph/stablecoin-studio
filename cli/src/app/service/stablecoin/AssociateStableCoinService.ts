import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class AssociateStableCoinsService extends Service {
  constructor() {
    super('Associate Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async associateStableCoin(
    treasuryId: string,
    privateKey: string,
    accountId: string,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = new SDK();

    utilsService.breakLine();

    let respDetail: void;

    await utilsService.showSpinner(
      sdk
        .associateToken({ treasuryId, privateKey, accountId })
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
