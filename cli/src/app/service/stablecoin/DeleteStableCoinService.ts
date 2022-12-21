import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { DeleteRequest, StableCoin } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class DeleteStableCoinService extends Service {
  constructor() {
    super('Delete Stable Coin');
  }

  /**
   * give supplier role
   */
  public async deleteStableCoin(req: DeleteRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.delete(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.deleteCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
