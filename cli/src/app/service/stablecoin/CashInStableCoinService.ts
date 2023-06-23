import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { CashInRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

export default class CashInStableCoinService extends Service {
  constructor() {
    super('Cash In Stable Coin');
  }

  public async cashInStableCoin(request: CashInRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.cashIn(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.cashInCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
