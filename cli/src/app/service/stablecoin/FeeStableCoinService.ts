import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { AddFixedFeeRequest, Fees } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class FeeStableCoinService extends Service {
  constructor() {
    super('Fee Stable Coin');
  }

  public async addFixedFee(req: AddFixedFeeRequest): Promise<void> {
    await utilsService.showSpinner(Fees.addFixedFee(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.customFeeCreated') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
