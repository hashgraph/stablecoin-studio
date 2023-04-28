import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { BurnRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Burn Stable Coin Service
 */
export default class BurnStableCoinsService extends Service {
  constructor() {
    super('Burn Stable Coin');
  }

  /**
   * Burn Stable Coin
   */
  public async burnStableCoin(req: BurnRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.burn(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.burnCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
