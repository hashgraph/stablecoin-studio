import { AppMetadata, HederaNetwork, NetworkMode, SDK } from '../src/index';
import {
	IRequestBalanceOf,
	IRequestContracts,
} from '../src/port/in/sdk/request/IRequestContracts';
import { IGetStableCoinRequest } from '../src/port/in/sdk/request/IGetStableCoinRequest';
import { IGetListStableCoinRequest } from '../src/port/in/sdk/request/IGetListStableCoinRequest';
import { ICreateStableCoinRequest } from '../src/port/in/sdk/request/ICreateStableCoinRequest.js';
import { StableCoin } from '../src/domain/context/stablecoin/StableCoin.js';
import Account from '../src/domain/context/account/Account.js';
import { IRescueStableCoinRequest } from '../src/port/in/sdk/request/IRescueStableCoinRequest.js';
import { ICashInStableCoinRequest } from '../src/port/in/sdk/request/ICashInStableCoinRequest.js';
import { AccountId } from '../src/domain/context/account/AccountId.js';

const ACCOUNT_ID = '0.0.29511696';
const PK =
	'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be';

const account = new Account(new AccountId(ACCOUNT_ID), '1234');
const request: ICreateStableCoinRequest = {
	accountId: account.accountId.id,
	privateKey: account.privateKey,
	name: 'PapaCoin',
	symbol: 'PAPA',
	decimals: 2,
	initialSupply: 100n,
	maxSupply: 1000n,
	memo: 'test',
	freeze: '1234',
	freezeDefault: false,
};

describe('SDK Unit Test :tubo_de_ensayo:', () => {
	let sdk: SDK;

	const testAppMetadata: AppMetadata = {
		icon: '',
		name: 'test-app',
		description: 'description example for test app',
		url: 'localhost',
	};

	// Act before assertions
	beforeAll(async () => {
		// Read more about fake timers
		// http://facebook.github.io/jest/docs/en/timer-mocks.html#content
		// Jest 27 now uses "modern" implementation of fake timers
		// https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults
		// https://github.com/facebook/jest/pull/5171
		sdk = await new SDK({
			network: HederaNetwork.TEST,
			mode: NetworkMode.EOA,
			options: {
				account: new Account(new AccountId(ACCOUNT_ID), PK),
			},
		}).init();
	});

	// Teardown (cleanup) after assertions
	afterAll(() => {
		console.log('afterAll: hook');
	});

	// Assert sdk not null
	it('loads the class', () => {
		expect(sdk).not.toBeNull();
	});

	it('Account class', () => {
		const account = new Account(new AccountId(ACCOUNT_ID), '1234');
		account.privateKey = '5678';

		expect(account.accountId).toBe('0.0.2');
		expect(account.privateKey).toBe('5678');
	});

	it('Stable Coin class', () => {
		const account = new Account(new AccountId(ACCOUNT_ID), '1234');
		const stableCoin = new StableCoin(account, 'Token', 'TK', 10);

		expect(stableCoin.admin).toBe(account);
		expect(stableCoin.name).toBe('Token');
		expect(stableCoin.symbol).toBe('TK');
		expect(stableCoin.decimals).toBe(10);
		expect(stableCoin.id).toBe('1234');
	});

	it('Creates a Stable Coin', () => {
		const coin = sdk.createStableCoin(request);
		expect(coin).not.toBeNull();
		console.log(coin);
	});

	it('Creates a Stable Coin (Decimals Error)', () => {
		const errReq = { ...request };
		errReq.decimals = 20;
		try {
			const coin = sdk.createStableCoin(errReq);
			expect(coin).toBeNull();
		} catch (err) {
			console.log(err);
		}
	});

	it('Get list Stable coins', async () => {
		const request: IGetListStableCoinRequest = {
			privateKey:
				'302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69',
		};
		const coin = await sdk.getListStableCoin(request);
		expect(coin).not.toBeNull();
	});

	it('Get details Stable coins', async () => {
		const request: IGetStableCoinRequest = {
			id: '0.0.30873406',
		};
		const coin = await sdk.getStableCoin(request);
		expect(coin).not.toBeNull();
	});

	it('Get balance of Stable coin', async () => {
		const request: IRequestBalanceOf = {
			treasuryId: '0.0.48135063',
			privateKey:
				'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
			accountId: '0.0.29511696',
			targetId: '0.0.29511696',
		};

		await sdk.getBalanceOf(request)?.then((response) => {
			expect(response).not.toBeNull();
		});
	});

	it('Get balance of Stable coin - Revert', async () => {
		const request: IRequestBalanceOf = {
			treasuryId: '0.0.48135063',
			privateKey:
				'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
			accountId: '0.0.29511690',
			targetId: '0.0.29511696',
		};
		try {
			await sdk.getBalanceOf(request)?.then((response) => {
				expect(response).not.toBeNull();
			});
		} catch (err) {
			console.log('Get balance of Stable coin - Revert');
		}
	});

	it('Get name of Stable coin', async () => {
		const request: IRequestContracts = {
			treasuryId: '0.0.48135063',
			privateKey:
				'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
			accountId: '0.0.29511696',
		};

		await sdk.getNameToken(request)?.then((response) => {
			expect(response).not.toBeNull();
		});
	});

	it('Cash in Stable coin', async () => {
		const request: ICashInStableCoinRequest = {
			treasuryId: '0.0.48135054',
			privateKey:
				'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
			accountId: '0.0.29511696',
			amount: 100,
		};

		await sdk.cashIn(request)?.then((response) => {
			expect(response).not.toBeNull();
		});
	});

	it('Rescue Stable coin', async () => {
		const request: IRescueStableCoinRequest = {
			treasuryId: '0.0.48135054',
			privateKey:
				'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
			accountId: '0.0.29511696',
			amount: 1,
		};

		await sdk.rescue(request)?.then((response) => {
			expect(response).not.toBeNull();
		});
	});
});
