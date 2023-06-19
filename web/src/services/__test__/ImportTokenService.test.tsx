import ImportTokenService from '../ImportTokenService';

describe(`<${ImportTokenService.name} />`, () => {
	test('should save the tokensAccount', async () => {
		jest.spyOn(Storage.prototype, 'setItem');
		Storage.prototype.setItem = jest.fn();

		await ImportTokenService.importToken('tokenId', 'tokenSymbol', 'accountId');

		expect(localStorage.setItem).toHaveBeenCalled();
	});

	test('should create the tokensAccount', async () => {
		const tokensAccount = JSON.stringify([
			{
				id: 'accountId',
				externalTokens: [
					{
						id: 'tokenId',
						symbol: 'tokenSymbol',
					},
				],
			},
		]);
		jest.spyOn(Storage.prototype, 'setItem');
		Storage.prototype.tokensAccount = tokensAccount;
		await ImportTokenService.importToken('tokenId', 'tokenSymbol', 'accountId');

		expect(localStorage.setItem).toHaveBeenCalled();
	});
});
