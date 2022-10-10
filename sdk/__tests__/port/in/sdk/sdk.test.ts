import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import { SDK } from '../../../../src/index.js';
import { ACCOUNTS, getSDKAsync } from '../../../core/core.js';
import { StableCoinRole } from '../../../../src/core/enum.js';

describe('🧪 [PORT] SDK', () => {
  let sdk: SDK;

  beforeAll(async () => {
    sdk = await getSDKAsync();
  });

  it('Creates a Stable Coin with EOAccount', async () => {
    const coin = await sdk.createStableCoin({
      account: ACCOUNTS.testnet,
      name: 'TEST COIN',
      symbol: 'TC',
      decimals: 0,
    });
    expect(coin).not.toBeNull();
    expect(coin?.tokenId).toBeTruthy();
  }, 120_000);

  it('Gets the token info', async () => {
    const coin = await sdk.getStableCoinDetails({
      id: '0.0.48195895',
    });
    expect(coin).not.toBeNull();
    expect(coin?.decimals).toBeGreaterThanOrEqual(0);
    expect(coin?.adminKey).toBeInstanceOf(PublicKey);
    expect(coin?.name).toBeTruthy();
    expect(coin?.symbol).toBeTruthy();
  });

  it('Gets the token list', async () => {
    const list = await sdk.getListStableCoin({
      account: ACCOUNTS.testnet,
    });
    expect(list).not.toBeNull();
  });

  it('Gets the token balance', async () => {
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).not.toBe(0);
  });

  it('Gets the token name', async () => {
    const name = await sdk.getNameToken({
      account: ACCOUNTS.testnet,
      proxyContractId: '0.0.48195889',
    });
    expect(name).not.toBeNull();
    expect(name && name[0]).not.toBe('TEST COIN');
  });

  it('Cash in token', async () => {
    const amount = 10;
    const cashin = await sdk.cashIn({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      amount,
    });
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(cashin).not.toBeNull();
    expect(cashin).not.toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).not.toBe(amount);
  });

  it('Wipe token', async () => {
    const amount = 10;
    const wipe = await sdk.wipe({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      amount,
    });
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(wipe).not.toBeNull();
    expect(wipe).not.toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).not.toBe(0);
  });

  it('Check unlimited supplier role', async () => {
    const role = await sdk.isUnlimitedSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBeTruthy();
  });

  it('Check limited supplier role when user doesnt have it', async () => {
    const role = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBe(0);
  });

  it('Revoke supplier role', async () => {
    const role = await sdk.revokeRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      role: StableCoinRole.CASHIN_ROLE,
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBeTruthy();
  });

  it('Grant limited supplier role', async () => {
    const amount = 10;
    const role = await sdk.grantRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      role: StableCoinRole.CASHIN_ROLE,
      amount: amount,
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBeTruthy();

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(amount);
  });

  it('Increase Limit supplier role', async () => {
    const amount = 10;
    await sdk.increaseSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      amount: amount,
    });

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(20);
  });

  it('Decrease Limit supplier role', async () => {
    const amount = 10;
    await sdk.increaseSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      amount: amount,
    });
    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(amount);
  });

  it('reset Limit supplier role', async () => {
    await sdk.resetSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
    });

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(0);
  });

  it('Grant unlimited supplier role', async () => {
    await sdk.grantRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
      tokenId: '0.0.48195895',
      role: StableCoinRole.CASHIN_ROLE,
    });
    const check = await sdk.isUnlimitedSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: '0.0.48195889',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBeTruthy();
  });
});
