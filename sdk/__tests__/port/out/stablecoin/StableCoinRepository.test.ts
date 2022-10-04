/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Account, StableCoin } from '../../../../src/index.js';
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
				new StableCoin({
					name: baseCoin.name,
					symbol: baseCoin.symbol,
					decimals: baseCoin.decimals,
				}),
				ACCOUNTS.testnet,
			),
		).rejects.toThrow(HederaError);
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
});

function mockRepo(networkAdapter: NetworkAdapter, provider?: IProvider) {
	const deployFn = (
			coin: StableCoin,
			account: Account,
		) => {
			throw new Error();
		};
	if (!provider) {
		networkAdapter.provider.deployStableCoin = deployFn;
	} else {
		networkAdapter.provider = provider;
		networkAdapter.provider.deployStableCoin = deployFn;
	}
	return new StableCoinRepository(networkAdapter);
}
