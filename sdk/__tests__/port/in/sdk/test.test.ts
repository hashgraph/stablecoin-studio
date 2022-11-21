import { BigNumber } from '@hashgraph/hethers';
import {
  SDK,
  GetAccountBalanceRequest,
  CashInStableCoinRequest,
  CreateStableCoinRequest,
  BigDecimal,
  TokenSupplyType,
  PublicKey,
} from '../../../../src/index.js';
import { getSDKAsync, MAX_SUPPLY } from '../../../core/core.js';

const ACCOUNT = {
  accountId: '0.0.47820993',
  privateKey: {
    key: '0x4e3a8e419d6a10765ad1db628e1e86343a971543d14548e023143675f55a6875',
    type: 'ED25519',
  },
};

const PUBLICKEY = {
  type: 'ED25519',
  key: 'ac3abbf0e0170f9b30cdec6247421c996ca7d5ba2c6f3a7e94dca512f65a723b',
};

const minVal = '0.' + '0'.repeat(17) + '1';
const maxVal = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), 18).toString();

describe('🧪 [PORT] SDK', () => {
  let sdk: SDK;
  let tokenId: string;
  let proxyContractId: string;

  beforeAll(async () => {
    sdk = await getSDKAsync();
  });

  it('Deploy stable coin with 18 decimals', async () => {
    const req = new CreateStableCoinRequest({
      account: ACCOUNT,
      symbol: '18DEC',
      name: '18DEC',
      decimals: 18,
      initialSupply: minVal,
      maxSupply: maxVal,
      supplyType: TokenSupplyType.FINITE,
      supplyKey: PublicKey.NULL,
      adminKey: PUBLICKEY,
    });
    console.log(req);
    const res = await sdk.createStableCoin(req);
    console.log(res);
    expect(res).not.toBeNull();
    expect(res.tokenId).toBeTruthy();
    expect(res.memo).toBeTruthy();
    expect(res.memo?.proxyContract).toBeTruthy();
    expect(res.decimals).toBe(18);
    expect(res.initialSupply).toBe(minVal);
    expect(res.maxSupply).toBe(maxVal);
    tokenId = res.tokenId ?? '';
    proxyContractId = res.memo?.proxyContract ?? '';
  }, 120_000);

  it('Cash in small amount', async () => {
    const res = await sdk.cashIn(
      new CashInStableCoinRequest({
        account: ACCOUNT,
        proxyContractId: proxyContractId,
        targetId: ACCOUNT.accountId,
        tokenId: tokenId,
        amount: minVal,
      }),
    );
    console.log(res);
    expect(res).not.toBeNull();
  }, 15000);

  it('Get token balance', async () => {
    const res = await sdk.getBalanceOf(
      new GetAccountBalanceRequest({
        account: ACCOUNT,
        proxyContractId: proxyContractId,
        targetId: ACCOUNT.accountId,
        tokenId: tokenId,
      }),
    );
    console.log(res);
    expect(res).not.toBeNull();
    expect(res).toBe(minVal);
  }, 15000);
});
