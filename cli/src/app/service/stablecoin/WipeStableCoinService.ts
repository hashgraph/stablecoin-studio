import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { WipeStableCoinRequest, StableCoin } from 'hedera-stable-coin-sdk';

export default class WipeStableCoinsService extends Service {
  constructor() {
    super('Wipe Stable Coin');
  }

  public async wipeStableCoin(request: WipeStableCoinRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.wipe(request), {
      text: language.getText('state.loading'),
      successText: language.getText('state.wipeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
