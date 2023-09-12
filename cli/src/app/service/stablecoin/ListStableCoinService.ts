import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  Account,
  GetListStableCoinRequest,
  StableCoinListViewModel,
} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Create Stablecoin Service
 */
export default class ListStableCoinService extends Service {
  constructor() {
    super('List Stablecoins');
  }

  /**
   * List Stablecoins can be managed
   */
  public async listStableCoins(draw = true): Promise<StableCoinListViewModel> {
    // Call to list stablecoins
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

    draw && utilsService.drawTableListStableCoin(resp);
    return resp;
  }
}
