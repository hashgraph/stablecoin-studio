import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { EOAccount, SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class WipeStableCoinsService extends Service {
  constructor() {
    super('Wipe Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async wipeStableCoin(
    proxyContractId: string,
    account: EOAccount,
    tokenId: string,
    targetId: string,
    amount?: string,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .wipe({
          account,
          proxyContractId,
          tokenId,
          targetId,
          amount,
        })
        .then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.wipeCompleted') + '\n',
      },
    );

    console.log(
      respDetail
        ? language.getText('operation.success')
        : language.getText('operation.reject'),
    );

    utilsService.breakLine();
  }
}
