import {language, utilsService} from '../../../index.js';
import Service from '../Service.js';
import {RescueHBARRequest, StableCoin} from '@hashgraph/stablecoin-npm-sdk';

/**
 * Rescue HBAR Service
 */
export default class RescueHBARStableCoinService extends Service {
  constructor() {
    super('Rescue HBAR Stablecoin');
  }

  /**
   * Rescue HBAR Service
   */
  public async rescueHBARStableCoin(req: RescueHBARRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.rescueHBAR(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.rescueHBARCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
