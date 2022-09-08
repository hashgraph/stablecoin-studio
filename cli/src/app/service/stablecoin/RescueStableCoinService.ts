import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';

/**
 * Create Stable Coin Service
 */
export default class RescueStableCoinsService extends Service {
  constructor() {
    super('Rescue Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async rescueStableCoin(
    proxyContractId: string,
    privateKey: string,
    accountId: string,
    amount?: number,
  ): Promise<void> {
    const sdk: SDK = utilsService.getSDK();

    await utilsService.showSpinner(
      sdk.rescue({ proxyContractId, privateKey, accountId, amount }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
