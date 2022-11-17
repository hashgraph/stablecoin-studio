/* eslint-disable jest/no-disabled-tests */
import PublicKey from '../../../../src/domain/context/account/PublicKey.js';
import {
  BigDecimal,
  CreateStableCoinRequest,
  GetStableCoinDetailsRequest,
  GetListStableCoinRequest,
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  CheckCashInRoleRequest,
  ResetCashInLimitRequest,
  SDK,
  IncreaseCashInLimitRequest,
  DecreaseCashInLimitRequest,
  RescueStableCoinRequest,
  GetAccountBalanceRequest,
  AssociateTokenRequest,
  GetAccountInfoRequest,
  PauseStableCoinRequest,
  DeleteStableCoinRequest,
  CashInStableCoinRequest,
  WipeStableCoinRequest,
  CheckCashInLimitRequest,
} from '../../../../src/index.js';
import {
  ACCOUNTS,
  getSDKAsync,
  MAX_SUPPLY,
  REQUEST_ACCOUNTS,
} from '../../../core/core.js';
import { StableCoinRole } from '../../../../src/core/enum.js';
import BaseError from '../../../../src/core/error/BaseError.js';
import { BigNumber } from '@hashgraph/hethers';

describe('🧪 [PORT] SDK', () => {
  let sdk: SDK;
  let proxyContractId: string | undefined;
  let tokenId: string | undefined;

  beforeAll(async () => {
    sdk = await getSDKAsync();
  });

  it.skip('Creates a Stable Coin with EOAccount', async () => {
    const coin = await sdk.createStableCoin(
      new CreateStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        name: 'TEST COIN',
        symbol: 'TC',
        initialSupply: '10',
        decimals: 0,
        adminKey: {
          key: ACCOUNTS.testnet.privateKey.publicKey.key,
          type: ACCOUNTS.testnet.privateKey.publicKey.type,
        },
        freezeKey: PublicKey.NULL,
        // KYCKey:PublicKey.NULL,
        wipeKey: PublicKey.NULL,
        pauseKey: {
          key: ACCOUNTS.testnet.privateKey.publicKey.key,
          type: ACCOUNTS.testnet.privateKey.publicKey.type,
        },
        supplyKey: PublicKey.NULL,
      }),
    );
    proxyContractId = coin?.memo?.proxyContract;
    tokenId = coin?.tokenId;
    expect(coin).not.toBeNull();
    expect(coin?.tokenId).toBeTruthy();
  }, 120_000);

  it.skip('Creates a Stable Coin with EOAccount and 15 decimals and max_supply set to the maximum', async () => {
    const maxsup = BigDecimal.fromValue(BigNumber.from(MAX_SUPPLY), 15);
    const req = new CreateStableCoinRequest({
      account: REQUEST_ACCOUNTS.testnet,
      name: 'TEST COIN',
      symbol: 'TC',
      initialSupply: '1.123456789012345',
      maxSupply: maxsup.toString(),
      decimals: 15,
      adminKey: {
        key: ACCOUNTS.testnet.privateKey.publicKey.key,
        type: ACCOUNTS.testnet.privateKey.publicKey.type,
      },
      freezeKey: PublicKey.NULL,
      // KYCKey:PublicKey.NULL,
      wipeKey: PublicKey.NULL,
      pauseKey: PublicKey.NULL,
      supplyKey: PublicKey.NULL,
    });
    const coin = await sdk.createStableCoin(req);
    expect(coin).not.toBeNull();
    expect(coin?.tokenId).toBeTruthy();
  }, 120_000);

  it.skip('Throw Error initialSupply > maxSupply (wrong)', async () => {
    await expect(
      sdk.createStableCoin(
        new CreateStableCoinRequest({
          account: REQUEST_ACCOUNTS.testnet,
          name: 'TEST COIN',
          symbol: 'TC',
          initialSupply: '10',
          maxSupply: '9',
          decimals: 0,
          adminKey: {
            key: ACCOUNTS.testnet.privateKey.publicKey.key,
            type: ACCOUNTS.testnet.privateKey.publicKey.type,
          },
        }),
      ),
    ).rejects.toThrow(BaseError);
  }, 120_000);

  it.skip('Gets the token info', async () => {
    const coin = await sdk.getStableCoinDetails(
      new GetStableCoinDetailsRequest({
        id: tokenId ?? '0.0.48851945',
      }),
    );

    expect(coin).not.toBeNull();
    expect(coin?.decimals).toBeGreaterThanOrEqual(0);
    //expect(coin?.adminKey).toBeInstanceOf(PublicKey);
    expect(coin?.name).toBeTruthy();
    expect(coin?.symbol).toBeTruthy();
  });

  it.skip('Gets the token info, fails when not exists', async () => {
    const coin = sdk.getStableCoinDetails(
      new GetStableCoinDetailsRequest({
        id: '0.0.1',
      }),
    );

    await expect(coin).rejects.toThrow(BaseError);
  });

  it.skip('Gets the token list', async () => {
    const list = await sdk.getListStableCoin(
      new GetListStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
      }),
    );

    expect(list).not.toBeNull();
  });
  it.skip('Gets accountInfo', async () => {
    const list = await sdk.getAccountInfo(
      new GetAccountInfoRequest({
        account: REQUEST_ACCOUNTS.testnet,
      }),
    );
    console.log(list);
    expect(list).not.toBeNull();
  });

  it.skip('Cash in token', async () => {
    const amount = '10';
    const cashin = await sdk.cashIn(
      new CashInStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount,
      }),
    );
    const balance = await sdk.getBalanceOf(
      new GetAccountBalanceRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(cashin).not.toBeNull();
    expect(cashin).toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance).toBe(amount);
  }, 1500000);

  it.skip('Wipe token', async () => {
    const amount = '1';
    const wipe = await sdk.wipe(
      new WipeStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount,
      }),
    );
    const balance = await sdk.getBalanceOf(
      new GetAccountBalanceRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(wipe).not.toBeNull();
    expect(wipe).toBeTruthy();
    expect(balance).not.toBeNull();
    expect(balance && balance).toBe('9');
  }, 55000);

  it.skip('Wipe token (wrong)', async () => {
    const amount = '100';
    await expect(
      sdk.wipe(
        new WipeStableCoinRequest({
          account: REQUEST_ACCOUNTS.testnet,
          targetId: REQUEST_ACCOUNTS.testnet.accountId,
          proxyContractId: proxyContractId ?? '',
          tokenId: tokenId ?? '',
          amount,
        }),
      ),
    ).rejects.toThrow(Error);
  }, 15000);

  it.skip('Check unlimited supplier role', async () => {
    const role = await sdk.isUnlimitedSupplierAllowance(
      new CheckCashInRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
      }),
    );
    expect(role).not.toBeNull();
    expect(role && role[0]).toBeTruthy();
  }, 15000);

  it.skip('Check limited supplier role when user doesnt have it', async () => {
    const role = await sdk.supplierAllowance(
      new CheckCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(role).not.toBeNull();
    expect(role && role).toBe('0');
  }, 15000);

  it.skip('Revoke wipe role', async () => {
    let hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.WIPE_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).toBeTruthy();
    const role = await sdk.revokeRole(
      new RevokeRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        role: StableCoinRole.WIPE_ROLE,
      }),
    );
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.WIPE_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).not.toBeTruthy();
  }, 15000);

  it.skip('Revoke cash in role', async () => {
    let hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.CASHIN_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).toBeTruthy();
    const role = await sdk.revokeRole(
      new RevokeRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        role: StableCoinRole.CASHIN_ROLE,
      }),
    );
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.CASHIN_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).not.toBeTruthy();
  }, 15000);

  it.skip('Grant wipe role', async () => {
    let hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.WIPE_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).not.toBeTruthy();
    const role = await sdk.grantRole(
      new GrantRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        role: StableCoinRole.WIPE_ROLE,
      }),
    );
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.WIPE_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).toBeTruthy();
  }, 15000);
  it.skip('Grant limited cash in role', async () => {
    const amount = '10';
    let hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.CASHIN_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).not.toBeTruthy();
    const role = await sdk.grantRole(
      new GrantRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        role: StableCoinRole.CASHIN_ROLE,
        amount,
      }),
    );
    expect(role).not.toBeNull();
    hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.CASHIN_ROLE,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(hasRole && hasRole[0]).toBeTruthy();

    const check = await sdk.supplierAllowance(
      new CheckCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check).toBe('10');
  }, 25000);

  it.skip('Has role', async () => {
    const hasRole = await sdk.hasRole(
      new HasRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        role: StableCoinRole.WIPE_ROLE,
        targetId: '0.0.46824819',
        proxyContractId: proxyContractId ?? '0.0.48908568',
        tokenId: tokenId ?? '0.0.48908571',
      }),
    );
    expect(hasRole && hasRole[0]).toBeTruthy();
  });

  it.skip('Check limited supplier allowance', async () => {
    const check = await sdk.isLimitedSupplierAllowance(
      new CheckCashInRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check[0]).toBeTruthy();
  }, 15000);
  it.skip('Increase Limit supplier role', async () => {
    const amount = '10';
    await sdk.increaseSupplierAllowance(
      new IncreaseCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount: amount,
      }),
    );

    const check = await sdk.supplierAllowance(
      new CheckCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check).toBe('20');
  }, 15000);

  it.skip('Decrease Limit supplier role', async () => {
    const amount = '10';
    await sdk.decreaseSupplierAllowance(
      new DecreaseCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount: amount,
      }),
    );
    const check = await sdk.supplierAllowance(
      new CheckCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check).toBe('10');
  }, 15000);

  it.skip('reset Limit supplier role', async () => {
    const amount = '10';
    await sdk.increaseSupplierAllowance(
      new IncreaseCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount: amount,
      }),
    );
    await sdk.resetSupplierAllowance(
      new ResetCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
      }),
    );

    const check = await sdk.supplierAllowance(
      new CheckCashInLimitRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check).toBe('0');
  }, 15000);

  it.skip('Grant unlimited supplier role', async () => {
    await sdk.grantRole(
      new GrantRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        role: StableCoinRole.CASHIN_ROLE,
      }),
    );
    const check = await sdk.isUnlimitedSupplierAllowance(
      new CheckCashInRoleRequest({
        account: REQUEST_ACCOUNTS.testnet,
        targetId: REQUEST_ACCOUNTS.testnet.accountId,
        proxyContractId: proxyContractId ?? '',
      }),
    );
    expect(check).not.toBeNull();
    expect(check && check[0]).toBeTruthy();
  }, 15000);

  it.skip('Check account is address', async () => {
    const address = sdk.checkIsAddress(ACCOUNTS.testnet.accountId.id);
    expect(address).not.toBeNull();
    expect(address).toBeTruthy();
  }, 15000);

  it.skip('Check account is address (wrong address)', async () => {
    const address = sdk.checkIsAddress('0.0,0');
    expect(address).not.toBeNull();
    expect(address).not.toBeTruthy();
  }, 15000);

  it.skip('Rescue token', async () => {
    const amount = '1';
    const rescue = await sdk.rescue(
      new RescueStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
        amount,
      }),
    );
    expect(rescue).not.toBeNull();
    expect(rescue).toBeTruthy();
  }, 15000);

  it.skip('Rescue token (wrong)', async () => {
    const amount = '100';
    await expect(
      sdk.rescue(
        new RescueStableCoinRequest({
          account: REQUEST_ACCOUNTS.testnet,
          proxyContractId: proxyContractId ?? '',
          tokenId: tokenId ?? '',
          amount,
        }),
      ),
    ).rejects.toThrow(Error);
  }, 15000);

  it.skip('Get capabilities', async () => {
    const capabilities = await sdk.getCapabilitiesStableCoin(
      tokenId ?? '',
      ACCOUNTS.testnet.privateKey.publicKey.key,
    );
    expect(capabilities).not.toBeNull();
  }, 15000);

  it.skip('Associate token', async () => {
    const associateToken = sdk.associateToken(
      new AssociateTokenRequest({
        account: REQUEST_ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '',
      }),
    );
    await expect(associateToken).rejects.toThrow();
  }, 15000);

  it('Pause token', async () => {
    // const detailsRequest = new GetStableCoinDetailsRequest({
    //   id: tokenId ?? '0.0.48913786',
    // });
    // const detailsPrev = await sdk.getStableCoinDetails(detailsRequest);

    const pauseToken = await sdk.pauseStableCoin(
      new PauseStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '0.0.48913780',
        tokenId: tokenId ?? '0.0.48913786',
      }),
    );
    // const detailsPost = await sdk.getStableCoinDetails(detailsRequest);

    await expect(pauseToken).not.toBeNull();
    await expect(pauseToken).toBeTruthy();
    // await expect(detailsPrev?.paused).toBe('UNPAUSED');
    // await expect(detailsPost?.paused).toBe('PAUSED');
  }, 150000);

  it('Unpause token', async () => {
    // const detailsRequest = new GetStableCoinDetailsRequest({
    //   id: tokenId ?? '0.0.48913786', //PAUSED HTS -> 0.0.48913786
    // });
    // const detailsPrev = await sdk.getStableCoinDetails(detailsRequest);

    const unpauseToken = await sdk.unpauseStableCoin(
      new PauseStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '0.0.48913780',
        tokenId: tokenId ?? '0.0.48913786',
      }),
    );
    // const detailsPost = await sdk.getStableCoinDetails(detailsRequest);

    await expect(unpauseToken).not.toBeNull();
    await expect(unpauseToken).toBeTruthy();
    // await expect(detailsPrev?.paused).toBe('PAUSED');
    // await expect(detailsPost?.paused).toBe('UNPAUSED');
  }, 15000);

  it.skip('Delete token', async () => {
    const deleteToken = sdk.deteleStableCoin(
      new DeleteStableCoinRequest({
        account: REQUEST_ACCOUNTS.testnet,
        proxyContractId: proxyContractId ?? '',
        tokenId: tokenId ?? '',
      }),
    );
    await expect(deleteToken).rejects.toThrow();
  }, 15000);
});
