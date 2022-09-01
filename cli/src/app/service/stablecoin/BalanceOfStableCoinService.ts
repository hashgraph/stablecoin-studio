import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class BalanceOfStableCoinsService extends Service {
  constructor() {
    super('Balance Of Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async getBalanceOfStableCoin(
    treasuryId: string,
    privateKey: string,
    accountId: string,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = new SDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .getBalanceOf({ treasuryId, privateKey, accountId })
        .then((response) => {
          respDetail = response;
        }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log('Balance of Stable Coin: ', respDetail[0] / 1000);

    utilsService.breakLine();
  }
}
