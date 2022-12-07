import { StableCoin } from '../../../src/index.js';
import CashInRequest from '../../../src/port/in/request/CashInRequest.js';
import GetStableCoinDetailsRequest from '../../../src/port/in/request/GetStableCoinDetailsRequest.js';

describe('🧪 SDK test', () => {
	it('Instantiates StableCoin const', async () => {
		expect(StableCoin.cashIn).toBeDefined();
	});

	it('Does a CashIn (FAIL)', async () => {
		await expect(
			StableCoin.cashIn(
				new CashInRequest({
					amount: '1',
					tokenId: '0.0.1',
					targetId: '0.0.1',
				}),
			),
		).rejects.toThrow();
	});

	it('Gets a coin', async () => {
		const res = await StableCoin.getInfo(
			new GetStableCoinDetailsRequest({ id: '0.0.48954559' }),
		);
		console.log(res);
		expect(res).not.toBeNull();
		expect(res.decimals).not.toBeNull();
		expect(res.name).not.toBeNull();
		expect(res.symbol).not.toBeNull();
		expect(res.treasury).not.toBeNull();
		expect(res.tokenId).not.toBeNull();
	});
});
