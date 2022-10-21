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
    proxyContractId: string,
    account: EOAccount,
    tokenId: string,
    targetId: string,
  ): Promise<Capabilities[]> {
    const sdk: SDK = utilsService.getSDK();

    const capabilities = await sdk.getCapabilitiesStableCoin({proxyContractId, account, tokenId, targetId});

    return capabilities;
  }
}
