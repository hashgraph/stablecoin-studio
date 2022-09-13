/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { StableCoin } from '../../../../src/index.js';
import HederaError from '../../../../src/port/out/hedera/error/HederaError.js';
import { IProvider } from '../../../../src/port/out/hedera/Provider.js';
import NetworkAdapter from '../../../../src/port/out/network/NetworkAdapter.js';
import StableCoinRepository from '../../../../src/port/out/stablecoin/StableCoinRepository.js';
import { ACCOUNTS, baseCoin } from '../../../core.js';

const networkAdapter = () =>
	jest.mock(
		'../../../../src/port/out/network/NetworkAdapter',
	) as unknown as NetworkAdapter;
const provider = () =>
	jest.mock(
		'../../../../src/port/out/hedera/Provider',
	) as unknown as IProvider;

describe('🧪 [PORT] StableCoinRepository', () => {
	let repository: StableCoinRepository;

	beforeAll(async () => {
		// Mock
		repository = mockRepo(networkAdapter(), provider());
	});
	it('Fails to save a new coin with no provider', async () => {
		const repo: StableCoinRepository = mockRepo(
			networkAdapter(),
			undefined,
		);
		await expect(
			repo.saveCoin(
				ACCOUNTS.testnet.accountId,
				ACCOUNTS.testnet.privateKey,
				new StableCoin({
					name: baseCoin.name,
					symbol: baseCoin.symbol,
					decimals: baseCoin.decimals,
				}),
			),
		).rejects.toThrowError(HederaError);
	});

	it('Saves a new coin', async () => {
		const coin: StableCoin = await repository.saveCoin(
			ACCOUNTS.testnet.accountId,
			ACCOUNTS.testnet.privateKey,
			new StableCoin({
				name: baseCoin.name,
				symbol: baseCoin.symbol,
				decimals: baseCoin.decimals,
			}),
		);
		expect(coin).not.toBeNull();
	});
});

function mockRepo(networkAdapter: NetworkAdapter, provider?: IProvider) {
	if (!provider) {
		networkAdapter.provider.deployStableCoin = (
			accountId: string,
			privateKey: string,
			coin: StableCoin,
		) => {
			throw new Error();
		};
	} else {
		networkAdapter.provider = provider;
		networkAdapter.provider.deployStableCoin = (
			accountId: string,
			privateKey: string,
			coin: StableCoin,
		) => {
			return Promise.resolve(coin);
		};
	}
	return new StableCoinRepository(networkAdapter);
}
