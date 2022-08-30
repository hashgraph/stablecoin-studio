import { Account, ICreateStableCoinRequest, SDK } from '../src/index';
import { IGetListStableCoinRequest, IGetStableCoinRequest } from '../src/sdk';

describe('SDK Unit Test :tubo_de_ensayo:', () => {
	let sdk: SDK;

	// Act before assertions
	beforeAll(async () => {
		// Read more about fake timers
		// http://facebook.github.io/jest/docs/en/timer-mocks.html#content
		// Jest 27 now uses "modern" implementation of fake timers
		// https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults
		// https://github.com/facebook/jest/pull/5171
		sdk = new SDK();
	});

	// Teardown (cleanup) after assertions
	afterAll(() => {
		console.log('afterAll: hook');
	});

	// Assert sdk not null
	it('loads the class', () => {
		expect(sdk).not.toBeNull();
	});

	it('Creates a Stable Coin', () => {
		const request: ICreateStableCoinRequest = {
			account: new Account('0.0.1', '1234'),
			name: 'PapaCoin',
			symbol: 'PAPA',
			decimals: 2,
		};
		const coin = sdk.createStableCoin(request);
		expect(coin).not.toBeNull();
		console.log(coin);
	});

	it('Creates a Stable Coin (Decimals Error)', () => {
		const request: ICreateStableCoinRequest = {
			account: new Account('0.0.1', '1234'),
			name: 'PapaCoin',
			symbol: 'PAPA',
			decimals: 20,
		};
		const coin = sdk.createStableCoin(request);
		expect(coin).toBeNull();
	});

	it('Get list Stable coins', () => {
		const request: IGetListStableCoinRequest = {
			privateKey:
				'302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69',
		};
		const coin = sdk.getListStableCoin(request);
		expect(coin).not.toBeNull();
		console.log(coin);
	});

	it('Get details Stable coins', () => {
		const request: IGetStableCoinRequest = {
			stableCoinId: '0.0.30873406',
		};
		const coin = sdk.getStableCoin(request);
		expect(coin).not.toBeNull();
		console.log(coin);
	});
});
