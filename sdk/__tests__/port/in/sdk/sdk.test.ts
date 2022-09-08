import { SDK } from '../../../../src/index.js';
import { ACCOUNTS, getSDK } from '../../../core.js';

describe('🧪 [PORT] SDK', () => {
	let sdk: SDK;

	beforeAll(async () => {
		sdk = await getSDK();
	});

	it('Creates a Stable Coin with EOAccount', async () => {
		const coin = await sdk.createStableCoin({
			accountId: ACCOUNTS.testnet.accountId.id,
			privateKey: ACCOUNTS.testnet.privateKey.key,
			name: 'TEST COIN',
			symbol: 'TC',
			decimals: 0,
		});
		expect(coin).not.toBeNull();
	}, 120_000);

	it('Gets the token info', async () => {
		const coin = await sdk.getStableCoin({
			id: '0.0.48195895',
		});
		expect(coin).not.toBeNull();
	});
});
