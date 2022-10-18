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

  it('Gets the token balance', async () => {
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).toBe(0);
  });

  it('Gets the token name', async () => {
    const name = await sdk.getNameToken({
      account: ACCOUNTS.testnet,
      proxyContractId: proxyContractId ?? '',
    });
    expect(name).not.toBeNull();
    expect(name && name[0]).toBe('TEST COIN');
  });

  it('Cash in token', async () => {
    const amount = 10;
    const cashin = await sdk.cashIn({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount,
    });
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(cashin).not.toBeNull();
    expect(cashin).toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).toBe(amount);
  }, 15000);

  it('Wipe token', async () => {
    const amount = 1;
    const wipe = await sdk.wipe({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount,
    });
    const balance = await sdk.getBalanceOf({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(wipe).not.toBeNull();
    expect(wipe).toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance[0]).toBe(9);
  }, 15000);

  it('Wipe token (wrong)', async () => {
    const amount = 100;
    await expect(
      sdk.wipe({
        account: ACCOUNTS.testnet,
        targetId: ACCOUNTS.testnet.accountId.id,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount,
      }),
    ).rejects.toThrow(Error);
  }, 15000);

  it('Check unlimited supplier role', async () => {
    const role = await sdk.isUnlimitedSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBeTruthy();
  }, 15000);

  it('Check limited supplier role when user doesnt have it', async () => {
    const role = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(role).not.toBeNull();
    expect(role && role[0]).toBe(0);
  }, 15000);

  it('Revoke wipe role', async () => {
    let hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.WIPE_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).toBeTruthy();
    const role = await sdk.revokeRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      role: StableCoinRole.WIPE_ROLE,
    });
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.WIPE_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).not.toBeTruthy();
  }, 15000);

  it('Revoke cash in role', async () => {
    let hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.CASHIN_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).toBeTruthy();
    const role = await sdk.revokeRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      role: StableCoinRole.CASHIN_ROLE,
    });
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.CASHIN_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).not.toBeTruthy();
  }, 15000);

  it('Grant wipe role', async () => {
    let hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.WIPE_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).not.toBeTruthy();
    const role = await sdk.grantRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      role: StableCoinRole.WIPE_ROLE,
    });
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.WIPE_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).toBeTruthy();
  }, 15000);
  it('Grant limited cash in role', async () => {
    const amount = 10;
    let hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.CASHIN_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).not.toBeTruthy();
    const role = await sdk.grantRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      role: StableCoinRole.CASHIN_ROLE,
      amount,
    });
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole({
      account: ACCOUNTS.testnet,
      role: StableCoinRole.CASHIN_ROLE,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(hasRole && hasRole[0]).toBeTruthy();

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(amount);
  }, 15000);
  it('Check limited supplier allowance', async () => {
    const check = await sdk.isLimitedSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBeTruthy();
  }, 15000);
  it('Increase Limit supplier role', async () => {
    const amount = 10;
    await sdk.increaseSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount: amount,
    });

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(20);
  }, 15000);

  it('Decrease Limit supplier role', async () => {
    const amount = 10;
    await sdk.decreaseSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount: amount,
    });
    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(10);
  }, 15000);

  it('reset Limit supplier role', async () => {
    const amount = 10;
    await sdk.increaseSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount: amount,
    });
    await sdk.resetSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
    });

    const check = await sdk.supplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBe(0);
  }, 15000);

  it('Grant unlimited supplier role', async () => {
    await sdk.grantRole({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      role: StableCoinRole.CASHIN_ROLE,
    });
    const check = await sdk.isUnlimitedSupplierAllowance({
      account: ACCOUNTS.testnet,
      targetId: ACCOUNTS.testnet.accountId.id,
      proxyContractId: proxyContractId ?? '',
    });
    expect(check).not.toBeNull();
    expect(check && check[0]).toBeTruthy();
  }, 15000);

  it('Check account is address', async () => {
    const address = sdk.checkIsAddress(ACCOUNTS.testnet.accountId.id);
    expect(address).not.toBeNull();
    expect(address).toBeTruthy();
  }, 15000);

  it('Check account is address (wrong address)', async () => {
    const address = sdk.checkIsAddress('0.0,0');
    expect(address).not.toBeNull();
    expect(address).not.toBeTruthy();
  }, 15000);

  it('Rescue token', async () => {
    const amount = 1;
    const rescue = await sdk.rescue({
      account: ACCOUNTS.testnet,
      proxyContractId: proxyContractId ?? '',
      tokenId: tokenId ?? '',
      amount,
    });
    expect(rescue).not.toBeNull();
    expect(rescue).toBeTruthy();
  }, 15000);

  it('Rescue token (wrong)', async () => {
    const amount = 100;
    await expect(
      sdk.rescue({
        account: ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount,
      }),
    ).rejects.toThrowError('Amount is bigger than token owner balance');
  }, 15000);

  it('Get capabilities', async () => {
    const capabilities = await sdk.getCapabilitiesStableCoin(
      tokenId ?? '',
      ACCOUNTS.testnet.privateKey.publicKey.key,
    );
    expect(capabilities).not.toBeNull();
  }, 15000);

  it('Associate token', async () => {
    await expect(
      sdk.associateToken({
        account: ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '',
      }),
    ).rejects.toThrow();
  }, 15000);
  it('Throw Error initialSupply > maxSupply (wrong)', async () => {
    await expect(
      sdk.createStableCoin({
        account: ACCOUNTS.testnet,
        name: 'TEST COIN',
        symbol: 'TC',
        initialSupply: 10n,
        maxSupply: 9n,
        decimals: 0,
        adminKey: ACCOUNTS.testnet.privateKey.publicKey,
        wipeKey: PublicKey.NULL,
        supplyKey: PublicKey.NULL,
      }),
    ).rejects.toThrow(Error);
  }, 120_000);
});
