import AccountId from '../src/domain/context/account/AccountId.js';
import EOAccount from '../src/domain/context/account/EOAccount.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import {
	Configuration,
	HederaNetwork,
	NetworkMode,
	HederaNetworkEnviroment,
	SDK,
} from '../src/index.js';

const ACCOUNT_ID = '0.0.47822430';
const PK =
	'302e020100300506032b65700422042010f13d4517ae383e2a1a0f915b2f6e70a823f3627e69ab1a8f516666fecdf386';

export const ACCOUNTS: { testnet: EOAccount } = {
	testnet: new EOAccount({
		accountId: new AccountId(ACCOUNT_ID),
		privateKey: new PrivateKey(PK),
	}),
};

export const SDKConfig: { hethers: Configuration; hashpack: Configuration } = {
	hethers: {
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
		mode: NetworkMode.EOA,
		options: {
			account: ACCOUNTS.testnet,
		},
	},
	hashpack: {
		network: new HederaNetwork(HederaNetworkEnviroment.TEST),
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

export const baseCoin: { name: string; symbol: string; decimals: number } = {
	name: 'TEST COIN',
	symbol: 'TEST COIN',
	decimals: 3,
};
