import {
	HederaNetwork,
	HederaNetworkEnviroment,
	Configuration,
	NetworkMode,
	ICreateStableCoinRequest,
	SDK,
} from '../../../../src/index.js';
import { AccountId as HederaAccountId } from '@hashgraph/sdk';
import { ACCOUNTS, getSDKAsync } from '../../../core.js';
import PrivateKey from '../../../../src/domain/context/account/PrivateKey.js';
import AccountId from '../../../../src/domain/context/account/AccountId.js';

describe('🧪 [DOMAIN] StableCoin', () => {
	let sdk: SDK;

	it('Create an stable coin with custom nodes', async () => {
		const conf: Configuration = {
			network: new HederaNetwork(
				HederaNetworkEnviroment.TEST,
				{ '52.168.76.241:50211': new HederaAccountId(4) },
				'',
			),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			},
		};

		sdk = await getSDKAsync(conf);
		const create: ICreateStableCoinRequest = {
			accountId: new AccountId(ACCOUNTS.testnet.accountId.id),
			privateKey: new PrivateKey(ACCOUNTS.testnet.privateKey.key),
			name: 'Custom Nodes',
			symbol: 'CN',
			decimals: 2,
		};

		const stableCoin = await sdk.createStableCoin(create);

		expect(stableCoin).not.toBeNull();
		expect(stableCoin?.name).toStrictEqual(create.name);
		expect(stableCoin?.name).not.toEqual('prueba');
	}, 10_100_000);

	it('Create an stable coin with empty nodes', async () => {
		const conf: Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			},
		};

		sdk = await getSDKAsync(conf);
		const create: ICreateStableCoinRequest = {
			accountId: new AccountId(ACCOUNTS.testnet.accountId.id),
			privateKey: new PrivateKey(ACCOUNTS.testnet.privateKey.key),
			name: 'Custom Nodes',
			symbol: 'CN',
			decimals: 2,
		};

		const stableCoin = await sdk.createStableCoin(create);

		expect(stableCoin).not.toBeNull();
		expect(stableCoin?.name).toStrictEqual(create.name);
		expect(stableCoin?.name).not.toEqual('prueba');
	}, 10_100_000);
});
