import { StableCoin } from '../../../src/index.js';
import CashInRequest from '../../../src/port/in/request/CashInRequest.js';

describe('🧪 SDK test', () => {
	it('Instantiates StableCoin const', async () => {
		expect(StableCoin.cashIn).toBeDefined();
		const res = await StableCoin.cashIn(
			new CashInRequest({
				amount: '1',
				tokenId: '0.0.1',
				targetId: '0.0.1',
			}),
		);
		expect(res).toBe(true);
	});
});
