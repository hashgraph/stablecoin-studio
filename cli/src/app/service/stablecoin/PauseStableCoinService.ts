import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { PauseRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';

/**
 * Create Role Stablecoin Service
 */
export default class PauseStableCoinService extends Service {
  constructor() {
    super('Pause Stablecoin');
  }

  /**
   * pause stablecoin
   */
  public async pauseStableCoin(req: PauseRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.pause(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.pauseCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  /**
   * unpause stablecoin
   */
  public async unpauseStableCoin(req: PauseRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.unPause(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.unpauseCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
