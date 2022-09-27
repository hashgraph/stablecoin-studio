import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';
import type { Capabilities } from 'hedera-stable-coin-sdk';

/**
 * Capabilities Stable Coin Service
 */
export default class CapabilitiesStableCoinsService extends Service {
  constructor() {
    super('Capabilities Stable Coin');
  }

  /**
   * List Stable Coins can be managed
   */
  public async getCapabilitiesStableCoins(
    id: string,
    publicKey: string,
  ): Promise<Capabilities[]> {
    // Call to list stable coins
    const sdk: SDK = utilsService.getSDK();

    let capabilities: Capabilities[];

    await utilsService.showSpinner(
      sdk
        .getCapabilitiesStableCoin(id, publicKey)
        .then((response) => (capabilities = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );

    return capabilities;
  }
}
