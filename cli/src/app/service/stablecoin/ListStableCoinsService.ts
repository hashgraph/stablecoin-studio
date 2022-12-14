import { language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  Account,
  GetListStableCoinRequest,
  StableCoinListViewModel,
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
  public async listStableCoins(): Promise<StableCoinListViewModel> {
    // Call to list stable coins
    const currentAccount = utilsService.getCurrentAccount();

    let resp;

    await utilsService.showSpinner(
      Account.listStableCoins(
        new GetListStableCoinRequest({
          account: {
            accountId: currentAccount.accountId,
          },
        }),
      ).then((response) => (resp = response)),
      {
        text: language.getText('state.searching'),
        successText: language.getText('state.searchingSuccess') + '\n',
      },
    );

    return resp;
  }
}
