import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { WipeStableCoinRequest, SDK } from 'hedera-stable-coin-sdk';

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
    tokenId: string,
    targetId: string,
    amount?: string,
  ): Promise<void> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();
    let respDetail;
    const request = new WipeStableCoinRequest({
      proxyContractId,
      account: {
        accountId: currentAccount.accountId,
        privateKey: {
          key: currentAccount.privateKey.key,
          type: currentAccount.privateKey.type,
        },
      },
      tokenId,
      targetId,
      amount,
    });

    await utilsService.showSpinner(
      sdk.cashIn(request).then((response) => (respDetail = response)),
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
