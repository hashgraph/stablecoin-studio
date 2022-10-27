import {
  HederaNetwork,
  HederaNetworkEnviroment,
  Configuration,
  NetworkMode,
  ICreateStableCoinRequest,
  SDK,
  IStableCoinDetail,
} from '../../../../src/index.js';
import { AccountId, PrivateKey } from '@hashgraph/sdk';
import { Capabilities } from '../../../../src/domain/context/stablecoin/Capabilities.js';
import { ACCOUNTS, getSDKAsync } from '../../../core/core.js';

describe('🧪 [DOMAIN] StableCoin', () => {
  it('Create an stable coin with all funtionality', async () => {
    const { coin, sdk } = await createStableCoin();
    expect(coin.tokenId).not.toBeFalsy();
    const cap: Capabilities[] | null = await sdk.getCapabilitiesStableCoin(
      coin.tokenId ?? '',
      PrivateKey.fromString(
        ACCOUNTS.testnet.privateKey.key
      ).publicKey.toString()
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
      account: ACCOUNTS.testnet,
    },
  };

  const sdk = await getSDKAsync(conf);
  const create: ICreateStableCoinRequest = {
    account: ACCOUNTS.testnet,
    name: 'Custom Nodes',
    symbol: 'CN',
    decimals: 2,
  };
  const coin = await sdk.createStableCoin(create);
  if (!coin) throw new Error('Coin could not be created, aborting');
  return { coin, sdk };
}
