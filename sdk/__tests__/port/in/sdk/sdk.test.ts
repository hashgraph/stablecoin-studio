import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import { SDK } from '../../../../src/index.js';
import { ACCOUNTS, getSDKAsync } from '../../../core/core.js';
import { StableCoinRole } from '../../../../src/core/enum.js';

describe('🧪 [PORT] SDK', () => {
  let sdk: SDK;
  let proxyContractId: string | undefined;
  let tokenId: string | undefined;

  beforeAll(async () => {
    sdk = await getSDKAsync();
  });

  it('Creates a Stable Coin with EOAccount', async () => {
    const coin = await sdk.createStableCoin({
      account: ACCOUNTS.testnet,
      name: 'TEST COIN',
      symbol: 'TC',
      initialSupply: 10n,
      decimals: 0,
      adminKey: ACCOUNTS.testnet.privateKey.publicKey,
      wipeKey: PublicKey.NULL,
      supplyKey: PublicKey.NULL,
    });
    proxyContractId = coin?.memo?.proxyContract;
    tokenId = coin?.tokenId;
    expect(coin).not.toBeNull();
    expect(coin?.tokenId).toBeTruthy();
  }, 120_000);

  it('Gets the token info', async () => {
    const coin = await sdk.getStableCoinDetails({
      id: tokenId ?? '',
    });
    expect(coin).not.toBeNull();
    expect(coin?.decimals).toBeGreaterThanOrEqual(0);
    //expect(coin?.adminKey).toBeInstanceOf(PublicKey);
    expect(coin?.name).toBeTruthy();
    expect(coin?.symbol).toBeTruthy();
  });

  it('Gets the token list', async () => {
    const list = await sdk.getListStableCoin({
      account: ACCOUNTS.testnet,
    });
    expect(list).not.toBeNull();
  });
  it('Gets accountInfo', async () => {
    const list = await sdk.getAccountInfo({
      account: ACCOUNTS.testnet,
    });
    console.log(list)
    expect(list).not.toBeNull();
  });
  
});
