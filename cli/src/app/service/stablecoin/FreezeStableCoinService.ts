import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK, FreezeAccountRequest } from 'hedera-stable-coin-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class FreezeStableCoinService extends Service {
  constructor() {
    super('Freeze Stable Coin');
  }

  public async freezeAccount(req: FreezeAccountRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.freezeAccount(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.freezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async unfreezeAccount(req: FreezeAccountRequest): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(sdk.unfreezeAccount(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.unfreezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
