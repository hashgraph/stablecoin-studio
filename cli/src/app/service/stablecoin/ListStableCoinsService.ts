import { language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  EOAccount,
  IStableCoinList,
  PrivateKey,
  SDK,
} from 'hedera-stable-coin-sdk';

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

    let resp: IStableCoinList[];

    await utilsService.showSpinner(
      sdk
        .getListStableCoin({
          account: new EOAccount(
            currentAccount.accountId,
            new PrivateKey(currentAccount.privateKey),
          ),
        })
        .then((response: IStableCoinList[]) => (resp = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    utilsService.drawTableListStableCoin(resp);
  }
}
