import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { WipeRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

export default class WipeStableCoinsService extends Service {
  constructor() {
    super('Wipe Stable Coin');
  }

  public async wipeStableCoin(request: WipeRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.wipe(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.wipeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
