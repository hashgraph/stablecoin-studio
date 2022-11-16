import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK, DeleteStableCoinRequest } from 'hedera-stable-coin-sdk';

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
  public async deleteStableCoin(req: DeleteStableCoinRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.deteleStableCoin(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.deleteCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
