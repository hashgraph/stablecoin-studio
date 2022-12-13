import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { GetAccountBalanceRequest, StableCoin } from 'hedera-stable-coin-sdk';

export default class BalanceOfStableCoinsService extends Service {
  constructor() {
    super('Balance Of Stable Coin');
  }

  public async getBalanceOfStableCoin(
    req: GetAccountBalanceRequest,
  ): Promise<void> {
    let respDetail;

    await utilsService.showSpinner(
      StableCoin.getBalanceOf(req).then((response) => {
        respDetail = response;
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.balanceCompleted') + '\n',
      },
    );

    console.log('Balance of Stable Coin: ', respDetail);

    utilsService.breakLine();
  }
}
