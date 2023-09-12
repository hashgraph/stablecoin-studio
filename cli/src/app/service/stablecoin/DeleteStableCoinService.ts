import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { DeleteRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Create Role Stablecoin Service
 */
export default class DeleteStableCoinService extends Service {
  constructor() {
    super('Delete Stablecoin');
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
