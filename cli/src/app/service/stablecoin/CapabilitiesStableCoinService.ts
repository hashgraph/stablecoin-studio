import Service from '../Service.js';
import {
  CapabilitiesRequest,
  RequestAccount,
  StableCoin,
  StableCoinCapabilities,
} from 'hedera-stable-coin-sdk';

export default class CapabilitiesStableCoinsService extends Service {
  constructor() {
    super('Capabilities Stable Coin');
  }

  public async getCapabilitiesStableCoins(
    tokenId: string,
    account: RequestAccount,
  ): Promise<StableCoinCapabilities> {
    const capabilities = await StableCoin.capabilities(
      new CapabilitiesRequest({ account, tokenId }),
    );

    return capabilities;
  }
}
