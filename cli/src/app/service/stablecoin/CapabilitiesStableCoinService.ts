import Service from '../Service.js';
import {
  CapabilitiesRequest,
  RequestAccount,
  StableCoin,
  StableCoinCapabilities,
} from '@hashgraph/stablecoin-npm-sdk';

export default class CapabilitiesStableCoinsService extends Service {
  constructor() {
    super('Capabilities Stablecoin');
  }

  public async getCapabilitiesStableCoins(
    tokenId: string,
    account: RequestAccount,
    tokenIsPaused?: boolean,
    tokenIsDeleted?: boolean,
  ): Promise<StableCoinCapabilities> {
    const capabilities = await StableCoin.capabilities(
      new CapabilitiesRequest({
        account,
        tokenId,
        tokenIsPaused,
        tokenIsDeleted,
      }),
    );

    return capabilities;
  }
}
