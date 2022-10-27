/* eslint-disable @typescript-eslint/explicit-function-return-type */
import BigDecimal from '../../../../src/domain/context/stablecoin/BigDecimal.js';
import {
  Account,
  HederaNetwork,
  HederaNetworkEnviroment,
  IStableCoinList,
  StableCoin,
  StableCoinRole,
} from '../../../../src/index.js';
import HederaError from '../../../../src/port/out/hedera/error/HederaError.js';
import { IProvider } from '../../../../src/port/out/hedera/Provider.js';
import NetworkAdapter from '../../../../src/port/out/network/NetworkAdapter.js';
import StableCoinRepository from '../../../../src/port/out/stablecoin/StableCoinRepository.js';
import { ACCOUNTS, baseCoin } from '../../../core/core.js';

const networkAdapter = () =>
  jest.mock(
    '../../../../src/port/out/network/NetworkAdapter',
  ) as unknown as NetworkAdapter;
const provider = () =>
  jest.mock('../../../../src/port/out/hedera/Provider') as unknown as IProvider;

describe('🧪 [PORT] StableCoinRepository', () => {
  let repository: StableCoinRepository;

  beforeAll(async () => {
    // Mock
    repository = mockRepo(networkAdapter(), provider());
  });
  it('Saves a new coin', async () => {
    const coin: StableCoin = await repository.saveCoin(
      new StableCoin({
        name: baseCoin.name,
        symbol: baseCoin.symbol,
        decimals: baseCoin.decimals,
      }),
      ACCOUNTS.testnet,
    );
    expect(coin).not.toBeNull();
  });
  it('Fails to save a new coin with no provider', async () => {
    const repo: StableCoinRepository = mockRepo(networkAdapter(), undefined);
    await expect(
      repo.saveCoin(
        new StableCoin({
          name: baseCoin.name,
          symbol: baseCoin.symbol,
          decimals: baseCoin.decimals,
        }),
        ACCOUNTS.testnet,
      ),
    ).rejects.toThrow(HederaError);
  });

  it('Test getListStableCoins', async () => {
    const response: IStableCoinList[] = await repository.getListStableCoins(
      ACCOUNTS.testnet,
    );
    expect(Array.isArray(response)).toBeTruthy();
    expect(response).not.toBeNull();
  });

  it('Test getStableCoin', async () => {
    const coinId = '0.0.48586658';
    const response = await repository.getStableCoin(coinId);

    expect(response).not.toBeNull();
    expect(response).toBeInstanceOf(StableCoin);
    expect(response.id).toBe(coinId);
  });

  it('Test getCapabilitiesStableCoin', async () => {
    const coinId = '0.0.48586658';
    const response = await repository.getCapabilitiesStableCoin(
      coinId,
      ACCOUNTS.testnet.privateKey.key
    );
    expect(Array.isArray(response)).toBeTruthy();
    expect(response).not.toBeNull();
  });

  it('Test getBalanceOf', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const balance = await repository.getBalanceOf(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      stableCoinDetails.id,
      ACCOUNTS.testnet,
    );

    expect(balance).toBeInstanceOf(Uint8Array);
    expect(balance).not.toBeNull();
  });

  it('Test getName', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const balance = await repository.getNameToken(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet,
    );

    expect(balance).toBeInstanceOf(Uint8Array);
    expect(balance).not.toBeNull();
  });

  it('Test cashIn', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.cashIn(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test cashInHTS', async () => {
    const coinId = '0.0.48586658';
    const response = await repository.cashInHTS(
      coinId,
      BigDecimal.fromString('10000', 2),
      ACCOUNTS.testnet,
    );

    expect(response).toBeTruthy();
    expect(response).not.toBeNull();
  });

  it('Test cashOut', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.cashOut(
      stableCoinDetails.memo.proxyContract.toString(),
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test cashOutHTS', async () => {
    const coinId = '0.0.48586658';
    const response = await repository.cashOutHTS(
      coinId,
      BigDecimal.fromString('10000', 2),
      ACCOUNTS.testnet,
    );

    expect(response).toBeTruthy();
    expect(response).not.toBeNull();
  });

  it('Test associateToken', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.associateToken(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test wipe', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.wipe(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test wipeHTS', async () => {
    const coinId = '0.0.48586658';
    const response = await repository.wipeHTS(
      coinId,
      ACCOUNTS.testnet.accountId.toString(),
      BigDecimal.fromString('10000', 2),
      ACCOUNTS.testnet,
    );

    expect(response).toBeTruthy();
    expect(response).not.toBeNull();
  });

  it('Test grantSupplierRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.grantSupplierRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test grantUnlimitedSupplierRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.grantSupplierRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test isUnlimitedSupplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.isUnlimitedSupplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test supplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.supplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test revokeSupplierRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.revokeSupplierRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test resetSupplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.resetSupplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test increaseSupplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.increaseSupplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test decreaseSupplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.decreaseSupplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test rescue', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.rescue(
      stableCoinDetails.memo.proxyContract.toString(),
      BigDecimal.fromString('10000', stableCoinDetails.decimals),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test isLimitedSupplierAllowance', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.isLimitedSupplierAllowance(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test grantRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.grantRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      StableCoinRole.BURN_ROLE,
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test revokeRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.revokeRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      StableCoinRole.BURN_ROLE,
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });

  it('Test hasRole', async () => {
    const coinId = '0.0.48586658';
    const stableCoinDetails = await repository.getStableCoin(coinId);
    const response = await repository.hasRole(
      stableCoinDetails.memo.proxyContract.toString(),
      ACCOUNTS.testnet.accountId.toString(),
      StableCoinRole.BURN_ROLE,
      ACCOUNTS.testnet,
    );

    expect(response).toBeInstanceOf(Uint8Array);
    expect(response).not.toBeNull();
  });
});

function mockRepo(networkAdapter: NetworkAdapter, provider?: IProvider) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deployFnErr = (coin: StableCoin, account: Account) => {
    throw new Error();
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deployFn = (coin: StableCoin, account: Account) => {
    return Promise.resolve(coin);
  };
  const resolveHTS = () => {
    return Promise.resolve(true);
  };
  if (!provider) {
    networkAdapter.provider.deployStableCoin = deployFnErr;
  } else {
    networkAdapter.provider = provider;
    networkAdapter.provider.deployStableCoin = deployFn;
    networkAdapter.provider.callContract = () => {
      return Promise.resolve(new Uint8Array());
    };
    networkAdapter.provider.cashInHTS = resolveHTS;
    networkAdapter.provider.cashOutHTS = resolveHTS;
    networkAdapter.provider.wipeHTS = resolveHTS;
  }
  networkAdapter.network = new HederaNetwork(HederaNetworkEnviroment.TEST);
  return new StableCoinRepository(networkAdapter);
}
