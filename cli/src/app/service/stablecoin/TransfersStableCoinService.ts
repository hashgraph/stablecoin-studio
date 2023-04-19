import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  TransfersRequest,
  StableCoin,
} from '@hashgraph-dev/stablecoin-npm-sdk';

export default class TransfersStableCoinsService extends Service {
  constructor() {
    super('Transfers Stable Coin');
  }

  public async transfersStableCoin(request: TransfersRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.transfers(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.transferCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
