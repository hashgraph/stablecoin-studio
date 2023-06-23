import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { RescueRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Create Stable Coin Service
 */
export default class RescueStableCoinService extends Service {
  constructor() {
    super('Rescue Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async rescueStableCoin(req: RescueRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.rescue(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.rescueCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
