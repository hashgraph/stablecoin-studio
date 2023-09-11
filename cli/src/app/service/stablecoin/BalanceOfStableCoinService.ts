import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  GetAccountBalanceRequest,
  StableCoin,
  Balance,
} from '@hashgraph-dev/stablecoin-npm-sdk';

export default class BalanceOfStableCoinsService extends Service {
  constructor() {
    super('Balance Of Stablecoin');
  }

  public async getBalanceOfStableCoin(
    req: GetAccountBalanceRequest,
  ): Promise<void> {
    let respDetail: Balance;

    await utilsService.showSpinner(
      StableCoin.getBalanceOf(req).then((response) => {
        respDetail = response;
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.balanceCompleted') + '\n',
      },
    );

    console.log('Balance of Stablecoin: ', respDetail.value.toString());

    utilsService.breakLine();
  }

  public async getBalanceOfStableCoin_2(
    req: GetAccountBalanceRequest,
  ): Promise<string> {
    let respDetail: Balance;

    await utilsService.showSpinner(
      StableCoin.getBalanceOf(req).then((response) => {
        respDetail = response;
      }),
      {
        text: '',
        successText: '',
      },
    );

    return respDetail.value.toString();
  }
}
