import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { EOAccount, SDK } from 'hedera-stable-coin-sdk';

/**
 * Burn Stable Coin Service
 */
export default class BurnStableCoinsService extends Service {
  constructor() {
    super('Burn Stable Coin');
  }

  /**
   * Burn Stable Coin
   */
  public async burnStableCoin(
    proxyContractId: string,
    account: EOAccount,
    tokenId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    let respDetail;

    await utilsService.showSpinner(
      sdk
        .cashOut({
          proxyContractId,
          account,
          tokenId,
          amount,
        })
        .then((response) => (respDetail = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.burnCompleted') + '\n',
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
