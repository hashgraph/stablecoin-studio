import { StableCoin } from '../../../src/index.js';
import CashInRequest from '../../../src/port/in/request/CashInRequest.js';

describe('🧪 SDK test', () => {
	it('Instantiates StableCoin const', async () => {
		const sdk = StableCoin;
		expect(sdk.cashIn).toBeDefined();
		const res = await sdk.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: '0.0.1',
				targetId: '0.0.1',
			}),
		);
		expect(res).toBe(true);
	});
});
