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
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .associateToken({ treasuryId, privateKey, accountId })
        .then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(
      respDetail[0]
        ? language.getText('operation.success')
        : language.getText('operation.reject'),
    );

    utilsService.breakLine();
  }
}
