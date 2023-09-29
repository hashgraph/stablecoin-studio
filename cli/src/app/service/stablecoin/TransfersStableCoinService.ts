import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  TransfersRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';

export default class TransfersStableCoinService extends Service {
  constructor() {
    super('Transfers Stablecoin');
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
