
import Account from '../src/domain/context/account/Account.js';
import { AccountId } from '../src/domain/context/account/AccountId.js';
import { PrivateKey } from '../src/domain/context/account/PrivateKey.js';
import {
	Configuration,
	HederaNetwork,
	NetworkMode,
	HederaNetworkEnviroment,
	SDK,
} from '../src/index.js';

const ACCOUNT_ID = '0.0.29511696';
const PK =
	'302e020100300506032b6570042204207a8a25387a3c636cb980d1ba548ee5ee3cc8cda158e42dc7af53dcd81022d8be';

export const ACCOUNTS: { testnet: Account } = {
	testnet: new Account(new AccountId(ACCOUNT_ID), new PrivateKey(PK)),
};

export const SDKConfig: { hethers: Configuration; hashpack: Configuration } = {
	
	hethers: {
		network: new HederaNetwork(HederaNetworkEnviroment.TEST, []),
		mode: NetworkMode.EOA,
		options: {
			account: ACCOUNTS.testnet,
		},
	},
	hashpack: {
		network: new HederaNetwork(HederaNetworkEnviroment.TEST, []),
		mode: NetworkMode.HASHPACK,
		options: {
			appMetadata: {
				icon: '',
				name: 'test-app',
				description: 'description example for test app',
				url: 'localhost',
			},
		},
	},
};

export const getSDK = async (config?: Configuration): Promise<SDK> => {
	return await new SDK(config ?? SDKConfig.hethers).init();
};
