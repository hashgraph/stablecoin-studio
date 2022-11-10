import {
  HederaNetwork,
  HederaNetworkEnviroment,
  Configuration,
  NetworkMode,
  SDK,
  IStableCoinDetail,
  CreateStableCoinRequest,
  GetStableCoinDetails,
} from '../../../../src/index.js';
import { AccountId } from '@hashgraph/sdk';
import { Capabilities } from '../../../../src/domain/context/stablecoin/Capabilities.js';
import { ACCOUNTS, getSDKAsync, REQUEST_ACCOUNTS } from '../../../core/core.js';

describe('🧪 [DOMAIN] StableCoin', () => {
  it('Create an stable coin with all funtionality', async () => {
    const { coin, sdk } = await createStableCoin();
    expect(coin.tokenId).not.toBeFalsy();
    const stableCoinDetails = await sdk.getStableCoinDetails(
      new GetStableCoinDetails({
        id: coin.tokenId!,
      }),
    );
    expect(stableCoinDetails).not.toBeFalsy();
    expect(stableCoinDetails?.tokenId).not.toBeFalsy();
    const cap: Capabilities[] | null = await sdk.getCapabilitiesStableCoin(
      stableCoinDetails!.tokenId!,
      ACCOUNTS.testnet.privateKey.publicKey.key,
    );
    expect(cap).not.toBeNull();
  }, 180_000);
});

async function createStableCoin(): Promise<{
  coin: IStableCoinDetail;
  sdk: SDK;
}> {
  const conf: Configuration = {
    network: new HederaNetwork(
      HederaNetworkEnviroment.TEST,
      { '52.168.76.241:50211': new AccountId(4) },
      '',
    ),
    mode: NetworkMode.EOA,
    options: {
      account: REQUEST_ACCOUNTS.testnet,
    },
  };

  const sdk = await getSDKAsync(conf);
  const create: CreateStableCoinRequest = new CreateStableCoinRequest({
    account: REQUEST_ACCOUNTS.testnet,
    name: 'Custom Nodes',
    symbol: 'CN',
    decimals: 2,
  });
  const coin = await sdk.createStableCoin(create);
  if (!coin) throw new Error('Coin could not be created, aborting');
  return { coin, sdk };
}
