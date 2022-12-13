import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { PauseStableCoinRequest, StableCoin } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class PauseStableCoinService extends Service {
  constructor() {
    super('Pause Stable Coin');
  }

  /**
   * pause stable coin
   */
  public async pauseStableCoin(req: PauseStableCoinRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.pause(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.pauseCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * unpause stable coin
   */
  public async unpauseStableCoin(req: PauseStableCoinRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.unpause(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.unpauseCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
