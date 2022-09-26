import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Cash Out Stable Coin Service
 */
export default class CashOutStableCoinsService extends Service {
  constructor() {
    super('Cash Out Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async cashOutStableCoin(
    proxyContractId: string,
    privateKey: string,
    accountId: string,
    tokenId: string,
    amount?: number,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .cashOut({
          proxyContractId,
          privateKey,
          accountId,
          tokenId,
          amount,
        })
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
