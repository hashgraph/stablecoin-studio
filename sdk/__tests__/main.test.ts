import { SDK } from '../src/index';
import { ICreateStableCoinRequest } from '../src/port/in/sdk/request/ICreateStableCoinRequest.js';
import { getSDK, getSDKAsync } from './core.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import AccountId from '../src/domain/context/account/AccountId.js';
import EOAccount from '../src/domain/context/account/EOAccount.js';

const ACCOUNT_ID = '0.0.29511696';
const PK =
	'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be';

const account = new EOAccount({
	accountId: new AccountId(ACCOUNT_ID),
	privateKey: new PrivateKey(PK),
});
const request: ICreateStableCoinRequest = {
	accountId: new AccountId(account.accountId.id),
	privateKey: new PrivateKey(account.privateKey.key),
	name: 'PapaCoin',
	symbol: 'PAPA',
	decimals: 2,
	initialSupply: 100n,
	maxSupply: 1000n,
	memo: 'test',
	freezeDefault: false,
};

describe('🧪 SDK Unit Test', () => {
	let sdk: SDK;

	beforeEach(async () => {
		sdk = await getSDKAsync();
	});

	// Teardown (cleanup) after assertions
	afterAll(() => {
		console.log('afterAll: hook');
	});

	// Assert sdk not null
	it('Loads the class', () => {
		expect(sdk).not.toBeNull();
	});

	it('Emits initialization event', async () => {
		let data;
		await getSDKAsync(undefined, {
			onInit: (_data) => {
				data = _data;
			},
		});
		console.log(data);
		expect(data).not.toBeFalsy();
	});
	
	it('Connects to wallet', async () => {
		let event;
		const sdk = getSDK();

		expect(event).not.toBeFalsy();
	});
});
