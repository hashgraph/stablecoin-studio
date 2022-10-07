/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Account, StableCoin } from '../../../../src/index.js';
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
    console.log(repository.saveCoin);
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
});

function mockRepo(networkAdapter: NetworkAdapter, provider?: IProvider) {
  const deployFnErr = (coin: StableCoin, account: Account) => {
    throw new Error();
  };
  const deployFn = (coin: StableCoin, account: Account) => {
    return Promise.resolve(coin);
  };
  if (!provider) {
    networkAdapter.provider.deployStableCoin = deployFnErr;
  } else {
    networkAdapter.provider = provider;
    networkAdapter.provider.deployStableCoin = deployFn;
  }
  return new StableCoinRepository(networkAdapter);
}
