import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import { SDK } from 'hedera-stable-coin-sdk';
import type { EOAccount, Capabilities } from 'hedera-stable-coin-sdk';

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
    account: EOAccount,
    tokenId: string,
  ): Promise<Capabilities[]> {
    const sdk: SDK = utilsService.getSDK();

    const capabilities = await sdk.getCapabilitiesStableCoin({account, tokenId});

    return capabilities;
  }
}
