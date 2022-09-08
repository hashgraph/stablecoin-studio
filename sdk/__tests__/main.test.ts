import {
	SDK,
} from '../src/index';
import { ICreateStableCoinRequest } from '../src/port/in/sdk/request/ICreateStableCoinRequest.js';
import Account from '../src/domain/context/account/Account.js';
import { AccountId } from '../src/domain/context/account/AccountId.js';
import { getSDK } from './core.js';
import { PrivateKey } from '../src/domain/context/account/PrivateKey.js';

const ACCOUNT_ID = '0.0.29511696';
const PK =
	'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be';

const account = new Account(new AccountId(ACCOUNT_ID), new PrivateKey(PK));
const request: ICreateStableCoinRequest = {
	accountId: account.accountId.id,
	privateKey: account.privateKey.key,
	name: 'PapaCoin',
	symbol: 'PAPA',
	decimals: 2,
	initialSupply: 100n,
	maxSupply: 1000n,
	memo: 'test',
	freeze: '1234',
	freezeDefault: false,
};

describe('🧪 SDK Unit Test', () => {
	let sdk: SDK;

	beforeEach(async () => {
		sdk = await getSDK();
	});

	// Teardown (cleanup) after assertions
	afterAll(() => {
		console.log('afterAll: hook');
	});

	// Assert sdk not null
	it('Loads the class', () => {
		expect(sdk).not.toBeNull();
	});

	// it('Creates a Stable Coin', () => {
	// 	const coin = sdk.createStableCoin(request);
	// 	expect(coin).not.toBeNull();
	// 	console.log(coin);
	// });

	// it('Creates a Stable Coin (Decimals Error)', () => {
	// 	const errReq = { ...request };
	// 	errReq.decimals = 20;
	// 	try {
	// 		const coin = sdk.createStableCoin(errReq);
	// 		expect(coin).toBeNull();
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// });

	// it('Get list Stable coins', async () => {
	// 	const request: IGetListStableCoinRequest = {
	// 		privateKey:
	// 			'302e020100300506032b657004220420f284d8c41cbf70fe44c6512379ff651c6e0e4fe85c300adcd9507a80a0ee3b69',
	// 	};
	// 	const coin = await sdk.getListStableCoin(request);
	// 	expect(coin).not.toBeNull();
	// });

	// it('Get details Stable coins', async () => {
	// 	const request: IGetStableCoinRequest = {
	// 		id: '0.0.30873406',
	// 	};
	// 	const coin = await sdk.getStableCoin(request);
	// 	expect(coin).not.toBeNull();
	// });

	// it('Get balance of Stable coin', async () => {
	// 	const request: IRequestBalanceOf = {
	// 		treasuryId: '0.0.48135063',
	// 		privateKey:
	// 			'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
	// 		accountId: '0.0.29511696',
	// 		targetId: '0.0.29511696',
	// 	};

	// 	await sdk.getBalanceOf(request)?.then((response) => {
	// 		expect(response).not.toBeNull();
	// 	});
	// });

	// it('Get balance of Stable coin - Revert', async () => {
	// 	const request: IRequestBalanceOf = {
	// 		treasuryId: '0.0.48135063',
	// 		privateKey:
	// 			'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
	// 		accountId: '0.0.29511690',
	// 		targetId: '0.0.29511696',
	// 	};
	// 	try {
	// 		await sdk.getBalanceOf(request)?.then((response) => {
	// 			expect(response).not.toBeNull();
	// 		});
	// 	} catch (err) {
	// 		console.log('Get balance of Stable coin - Revert');
	// 	}
	// });

	// it('Get name of Stable coin', async () => {
	// 	const request: IRequestContracts = {
	// 		treasuryId: '0.0.48135063',
	// 		privateKey:
	// 			'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
	// 		accountId: '0.0.29511696',
	// 	};

	// 	await sdk.getNameToken(request)?.then((response) => {
	// 		expect(response).not.toBeNull();
	// 	});
	// });

	// it('Cash in Stable coin', async () => {
	// 	const request: ICashInStableCoinRequest = {
	// 		treasuryId: '0.0.48135054',
	// 		privateKey:
	// 			'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
	// 		accountId: '0.0.29511696',
	// 		amount: 100,
	// 	};

	// 	await sdk.cashIn(request)?.then((response) => {
	// 		expect(response).not.toBeNull();
	// 	});
	// });

	// it('Rescue Stable coin', async () => {
	// 	const request: IRescueStableCoinRequest = {
	// 		treasuryId: '0.0.48135054',
	// 		privateKey:
	// 			'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be',
	// 		accountId: '0.0.29511696',
	// 		amount: 1,
	// 	};

	// 	await sdk.rescue(request)?.then((response) => {
	// 		expect(response).not.toBeNull();
	// 	});
	// });
});
