import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { CashInStableCoinRequest, StableCoin } from 'hedera-stable-coin-sdk';

export default class CashInStableCoinsService extends Service {
  constructor() {
    super('Cash In Stable Coin');
  }

  public async cashInStableCoin(
    request: CashInStableCoinRequest,
  ): Promise<void> {
    await utilsService.showSpinner(StableCoin.cashIn(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.cashInCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
