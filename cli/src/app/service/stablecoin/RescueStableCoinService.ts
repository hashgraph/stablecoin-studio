import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { RescueStableCoinRequest, StableCoin } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class RescueStableCoinsService extends Service {
  constructor() {
    super('Rescue Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async rescueStableCoin(req: RescueStableCoinRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.rescue(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.rescueCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
